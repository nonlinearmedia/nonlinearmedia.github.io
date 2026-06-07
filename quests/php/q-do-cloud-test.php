<?php

include_once 'utils.php';

// Note: If you find the following command fails silently, make sure that
// apache belongs to the docker group. If you just added it, you need to
// restart httpd 

main();
sleep(5); // Enforce minimum wait

function main() {
  $BASE_DIR = "/var/www/quests.nonlinearmedia.org";

  date_default_timezone_set('America/Los_Angeles');
  $pid = getmypid();

  openlog("q-do-cloud-test.php", LOG_PID, LOG_LOCAL0);
  header('Content-type: application/json');

  // $_POST["u"] is the url at which the student's project can be found.
  // This is the URL we should pass to go.test.sh
  
  $url = isset($_POST['u']) ? $_POST['u'] : "";
  if ($url == "") {
    syslog(LOG_ERR, "URL turned up empty in q_do_cloud_test. Take a look.");
    $ret = (object) array("error" => 1, "out" => "Oops! Your url vanished. I'll look into this. Sorry.");
    echo json_encode($ret);
    return false;
  }

  $uniq_id = "q-cloud-" . uniqid();
  $test_dir = "$BASE_DIR/tests/$uniq_id";
  if (is_dir($test_dir))
    rrmdir($test_dir);
                                                                                //syslog(LOG_INFO, "mkdir($test_dir)");////
  mkdir($test_dir, 0755, true);
                                                                                //syslog(LOG_INFO, `ls -ld $test_dir`); ////
  $quest_name = isset($_POST['id']) ? $_POST['id'] : "not questing";

  $master_dir = "$BASE_DIR/masters/$quest_name";
  if (!is_dir($master_dir)) {
    $ret = (object) array("error" => 1, "code" => "Master directory missing");
    echo json_encode($ret);
    return;
  }

  // Copy over master source files.
  $dir = opendir($master_dir);
  if (!$dir) {
    syslog(LOG_ERR, "Couldn't open $master_dir");
    $ret = (object) array("error" => 1, "out" => "Master directory missing");
    echo json_encode($ret);
    rrmdir($test_dir);
  }

  while($file = readdir($dir)) {
    if (!is_file("$master_dir/$file"))
      continue;
    if (fnmatch("spec.pdf", $file)) // spec file may be large
      continue;
      
    copy("$master_dir/$file", "$test_dir/$file");
    chmod("$test_dir/$file", fileperms("$master_dir/$file"));
  }

  // Put the name of the text to test
  file_put_contents("$test_dir/.provided_input", $url);

  // Finally write the lab name
  file_put_contents("$test_dir/.lab_name", strtr($quest_name, " ", "_"));

  // ---  Run the test ---
  system("cd $test_dir; ./go.run-container.sh >./out.run-container.txt 2>&1");

  // collect scores and preserve code snapshot if possible
  $quarter_names = array("winter", "spring", "summer", "fall");

  $lab_id = trim(file_get_contents("$test_dir/.lab_id"));
  if ($lab_id == "") $lab_id = "unk";

  $year = date('Y');
  $qname = $quarter_names[floor((date('n')-1)/3)];
  $scores_dir = "$BASE_DIR/subs/scores/$year/$qname/$lab_id";
                                                                                //syslog(LOG_INFO, "mkdir -p $scores_dir"); ////
  if (!is_dir($scores_dir)) {
                                                                                //syslog(LOG_INFO, "mkdir -p $scores_dir"); ////
    mkdir($scores_dir, 0755, true);
  }

  // Calculate the total points from the test output file and write to "$scores_dir/$student_id"
  $student_id = get_student_id($test_dir);
                                                                                //syslog(LOG_INFO, "student id =  $student_id"); ////
  if ($student_id !== "") {
    $scores_log_file = "$scores_dir/$student_id";
    collect_score($student_id, $test_dir, $scores_log_file);
  }

  // Preserve code snapshot if Student ID is given (only most recent for now)
  if ($student_id !== "" && $student_id !== "ANON") {
    $source_dir = "$BASE_DIR/subs/sources/$year/$qname/$lab_id/$student_id";
                                                                                //syslog(LOG_INFO, "mkdir -p $source_dir"); ////
    system("/bin/rm -rf $source_dir");
                                                                                //syslog(LOG_INFO, "mkdir -p $source_dir"); ////
    mkdir($source_dir, 0755, true);
    system("/bin/cp -rf $test_dir/* $test_dir/.[a-z0-9]* $source_dir/");
                                                                                //syslog(LOG_INFO, "/bin/cp -rf $test_dir/* $test_dir/.[a-z0-9]* $source_dir/"); ////
  }

  $ret = make_response_object($test_dir);
                                                                                //syslog(LOG_INFO, print_r($ret, true)); ////
  echo json_encode($ret);
  
                                                                                //syslog(LOG_INFO, "removing $test_dir"); ////
  rrmdir($test_dir);
}

// create an object with the apprpriate errorcode, and the outputs from the
// server. Compiler output is in out.build.txt, test output is in out.test.txt
// If a memcheck was done, then out.memcheck.txt will hold its results
function make_response_object($dir) {
    $ret = array( "b" => "", "t" => "", "m" => "");
  
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

                                                                                  //syslog(LOG_INFO, print_r($ret, true)); ////
    return $ret;
}

// The cloud go.test-code.sh script leaves the student id in a file called 
// .student_id in $test_dir
//
// Try to find the student ID in a bunch of files and return ANON if not found
//
function get_student_id($test_dir) {
    $sid_file = "$test_dir/.student_id";
                                                                                  //syslog(LOG_INFO, "get_student_id($sid_file)"); ////
    if (!file_exists($sid_file) || filesize($sid_file) <= 0)
        return "unknown";

    $id = trim(file_get_contents($sid_file));
    if (preg_match('/^[-0-9A-Za-z@._]+$/', $id) != 1)
        return "ANON";
                                                                                  //syslog(LOG_INFO, "student id = $id"); ////
    // Sanitize
    $id = preg_replace("/[^-.0-9A-Za-z_@]/","", $id);

    return $id;
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
}

function q_get_lines($fname) {
    $out = "";
                                                                              //syslog(LOG_INFO, "opening $fname"); ////
    if (!file_exists($fname))
        return "";

    $output = shell_exec("/bin/cat -v $fname | /usr/bin/head -n 500");
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

