<?php

include_once 'utils.php';

/* At this point the uploaded files AND the master files are in $test_dir
 * We need to
 *  1. Compile, run and valgrind user code in the docker sandbox
 *  2. (TODO) Run checkstyle on the source files and capture the output
 *  3. Parse the outputs and return info in a json
 *
 * Note: If you find the following command fails silently, make sure that
 * apache belongs to the docker group. If you just added it, you need to
 * restart httpd (lesson learnt at the cost of 2+ hours of
 * debugging/experimentation)
 */

main();

function main() {
  $BASE_DIR = "/var/www/quests.nonlinearmedia.org";

  date_default_timezone_set('America/Los_Angeles');
  $pid = getmypid();

  openlog("q-do-test.php", LOG_PID, LOG_LOCAL0);
  header('Content-type: application/json');

  // $_POST["code"] is the name of the subdir where the uploader has left files
  $code = isset($_POST['code']) ? $_POST['code'] : "";
  if ($code == "") {
    syslog(LOG_ERR, "Submitted (/tmp/uniqid) dir name in q_upload was empty string in q_do_test");
    $ret = (object) array("error" => 1, "out" => "Oops! Your code vanished. I'll look into this. Sorry.");
    echo json_encode($ret);
    return false;
  }
  $test_dir = "$BASE_DIR/tests/$code";

  // Check if Student ID has been given. If so, set up the dir.
  $student_id = get_student_id("$test_dir");
                                                                                syslog(LOG_INFO, "Student ID '$student_id' just submitted");////

  $quarter_names = array("winter", "spring", "summer", "fall");

  $lab_id = trim(file_get_contents("$test_dir/.lab_id"));
  if ($lab_id == "") $lab_id = "unk";

  $year = date('Y');
  $qname = $quarter_names[floor((date('n')-1)/3)];
  $scores_dir = "$BASE_DIR/subs/scores/$year/$qname/$lab_id";
  if (!is_dir($scores_dir)) {
                                                                                syslog(LOG_INFO, "mkdir -p $scores_dir"); ////
    mkdir($scores_dir, 0755, true);
  }

                                                                                //syslog(LOG_INFO, "cd $test_dir; ./go.run-container.sh >./out.run-container.txt 2>&1");
  system("cd $test_dir; ./go.run-container.sh >./out.run-container.txt 2>&1");

  // Calculate the total points from the test output file and write to "$scores_dir/$student_id"
  if ($student_id !== "") {
    $scores_log_file = "$scores_dir/$student_id";
    collect_score($student_id, $test_dir, $scores_log_file);
  }

  // Preserve code snapshot if Student ID is given (only most recent for now)
  if ($student_id !== "" && $student_id !== "ANON") {
    $source_dir = "$BASE_DIR/subs/sources/$year/$qname/$lab_id/$student_id";
    system("/bin/rm -rf $source_dir");
                                                                                //syslog(LOG_INFO, "mkdir -p $source_dir"); ////
    mkdir($source_dir, 0755, true);
    system("/bin/cp -rf $test_dir/* $test_dir/.[a-z0-9]* $source_dir/");
                                                                                //syslog(LOG_INFO, "/bin/cp -rf $test_dir/* $test_dir/.[a-z0-9]* $source_dir/"); ////
  }

  $ret = make_response_object($test_dir);
                                                                                //syslog(LOG_INFO, print_r($ret, true)); ////
  echo json_encode($ret);
  
  rrmdir($test_dir);
}

// create an object with the apprpriate errorcode, and the outputs from the
// server. Compiler output is in out.build.txt, test output is in out.test.txt
// If a memcheck was done, then out.memcheck.txt will hold its results
// If the dir contains a ui-overrides.json file, it's jsonified content
// will be put in "s" (4/1/2020)
//
function make_response_object($dir) {
    $ret = array( "b" => "", "t" => "", "m" => "", "s" => "{}" );
  
    // compiler output
    if (file_exists("$dir/out.build.txt"))
        $ret["b"] = "<PRE>" . q_get_lines("$dir/out.build.txt") . "</PRE>";

    // test run output
    if (file_exists("$dir/out.test.txt")) {
        $ret["t"] = "<PRE>" . q_get_lines("$dir/out.test.txt") . "</PRE>";
    }

    // memcheck output
    if (file_exists("$dir/out.memcheck.txt"))
        $ret["m"] = "<PRE>" . q_get_lines("$dir/out.memcheck.txt") . "</PRE>";

    // ui-overrides
    if (file_exists("$dir/ui-overrides.json"))
        $ret["s"] = file_get_contents("$dir/ui-overrides.json");
                                                                                  //syslog(LOG_INFO, print_r($ret, true)); ////
    return $ret;
}

function get_student_id($test_dir) {
    // Try to find the student ID in a bunch of files and return ANON if not found
    $dir = opendir($test_dir);
    if (!$dir) {
      syslog(LOG_ERR, "Couldn't open $test_dir when trying to find Student ID");
      $ret = (object) array("error" => 1, "out" => "Couldn't open test directory");
      echo json_encode($ret);
      rrmdir($test_dir);
    }

    while($file = readdir($dir)) {
        if (!is_file("$test_dir/$file")) {
            continue;
        }
        if (starts_with($file, "Ref") || starts_with($file, "ref_")
            || starts_with($file, "spec.pdf") || starts_with($file,".")
            || starts_with($file, "go.") || starts_with($file, "out.")) {
            continue;
        }
        $fh = fopen("$test_dir/$file", "r");
        while(!feof($fh) && ($line = fgets($fh)) !== false) {
            $line = preg_replace('/[^-_.@:0-9A-Za-z]/i', '', $line); // screen
            
            if (preg_match('/^.*student *id *: *([-_.@A-Za-z0-9]+).*/iS', $line, $matches)) {
                fclose($fh);

                // Sanitize
                $id = preg_replace("/[^-_.@A-Za-z0-9]/","", $matches[1]);
                                                                                 //syslog(LOG_INFO, "Got $id from $file"); ////
                return $id;
            }
        }
        fclose($fh);
    }
    return "ANON";
}

function get_score_from_output_file($outfile) {
    $score = 0;
    
    if (!file_exists($outfile)) {
        syslog(LOG_ERR, "Can't get score from nonexistent $outfile");
        return $score;
    }
    $fh = fopen($outfile, "r");
    if (!$fh) {
        syslog(LOG_ERR, "Couldn't open $outfile");
        return $score;
    }

    while (!feof($fh) && ($line = fgets($fh)) !== false) {
        //syslog(LOG_INFO, "got score line: $line"); ////
        if (preg_match('/^([0-9.]+) point.?/', $line, $matches)) {       // This is for backward compatibility to old scores lines
            $score += $matches[0];
        } else if (preg_match('/^ *Hooray! ([0-9.]+) /', $line, $matches)) {
            //syslog(LOG_INFO, "got matches: " . print_r($matches, true)); ////
            $score += $matches[1];
        }
    }
    fclose($fh);

    return $score;
}

function get_score_from_score_file($score_file) {
    $score = 0;

    if (!file_exists($score_file)) {
        syslog(LOG_ERR, "Couldn't get score from nonexisttent $score_file");
        return $score;
    }
    $score = hexdec(file_get_contents($score_file));
    return $score;
}

// 1. $test_dir/.[0-9]*.s (score in hex) OR
// 2. Total up hooray points from out.test.txt
// 
function collect_score($student_id, $test_dir, $scores_log_file) {
    $score_files = glob("$test_dir/.[1-9][0-9]*.s");

    if (count($score_files) == 0)
        $score = get_score_from_output_file("$test_dir/out.test.txt");
    else
        $score = get_score_from_score_file($score_files[0]);
  
    $ts = date('U');
    $log_line = "$ts, $student_id, $score";
    file_put_contents($scores_log_file, $log_line.PHP_EOL, FILE_APPEND | LOCK_EX);
                                                                               syslog(LOG_INFO, "$ts $student_id $score added to $scores_log_file");
}

function q_get_lines($fname) {
    $out = "";
                                                                              //syslog(LOG_INFO, "opening $fname"); ////
    if (!file_exists($fname))
        return "";

    $output = shell_exec("/bin/cat -v $fname | /usr/bin/head -n 5000");
    $lines = explode("\n", $output);
    for ($i = 0; $i < count($lines); $i++) {
        $line = $lines[$i];
                                                                             //syslog(LOG_INFO, "got line = $line"); ////
        $line = str_replace("/sandbox", "", $line);
        $line = preg_replace("/\^M$/", "", $line);
        $line = preg_replace("/^==[0-9][0-9]== /", "", $line);
        $line = preg_replace("/.*floating point exception.*/i",
          "\nSorry m'Lord - That don't compute sez the fpu.", $line);
        $line = preg_replace("/.*Segmentation.*/i",
          "\nAlas! You went into the wildies and got killed before you could finish your quest.", $line);
        $line = preg_replace("/.*core dumped.*/i",
          "\nAlas! Your core got dumped before you got what you wanted.", $line);
        $line = preg_replace("/.*Abort.*/i",
          "\nMission aborted, Cap'n. There wuzza bolt from Zuse. We musta gone dun somethin bad.", $line);
        if (strpos($line, "valgrind") !== false || strpos($line, "apache") !== false || strpos($line, "./go.") !== false)
            continue;
        $out .= "$line\n";
                                                                             //syslog(LOG_INFO, "now out = $out"); ////
    }

    return $out;
}

function starts_with($haystack, $needle) {
    $length = strlen($needle);
    return (substr($haystack, 0, $length) === $needle);
}
