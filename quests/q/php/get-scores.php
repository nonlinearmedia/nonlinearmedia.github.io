<?php

// Note:
// submitted source files (most recent) are in
//   $BASE_DIR/subs/sources/$yyyy/$season/$lab_id/$student_id/*.*
// submission scores (all) are in a single file:
//   $BASE_DIR/subs/scores/$yyyy/$season/$lab_id/$student_id
//
// TODO: Move this into dynamo
//
$BASE_DIR = "/var/www/quests.nonlinearmedia.org";

main();

// --------------------------------------------------------------------
    
function main() {
    global $BASE_DIR;
    
    date_default_timezone_set('America/Los_Angeles');
    $pid = getmypid();

    openlog("scores/get-scores.php", LOG_PID, LOG_LOCAL0);
    header('Content-type: application/json');

    $student_id = isset($_POST['i']) ? $_POST['i'] : "";
    //$student_id = "anand"; ////
    //$student_id = "12345678"; ////
    syslog(LOG_INFO, " --- Student ID: $student_id");

    // Find the season to determine the right places to look
    $quarter_names = array("winter", "spring", "summer", "fall");
    $year = date('Y');
    $qname = $quarter_names[floor((date('n')-1)/3)];
    $scores_dir = "$BASE_DIR/subs/scores/$year/$qname";
    $sources_dir = "$BASE_DIR/subs/sources/$year/$qname";
  
    // The contents of the above dir should be like { 2a.01, 2a.02, 2a.03, ... }
                                                                        //syslog(LOG_INFO, "scores dir = $scores_dir"); ////
    $lab_ids = scandir($scores_dir);

    // Annotation by example:
    //        $BASE_DIR/subs/scores/2019/summer/2a.01/12345678
    // contains scores for Quest 2a.01 by ID 12345678
    // and 
    //     $BASE_DIR/subs/sources/2019/summer/2a.01/12345678/*
    // contains their submitted source
    //
    // The matching source directory is read for the name of the lab.
    // The file .lab_name contains the entry-code (friendlyname)
    // as entered by the student. This name is not provided in the
    // master dir. It will be created by ct_upload.php after replacing
    // spaces with underscores in the entry-code (e.g. an_elephant_who_remembers)
    //

    $labs = array();
    foreach ($lab_ids as $lab_id) {
	if ($lab_id[0] == '.') continue;         // skip hidden files

	if (!is_dir("$scores_dir/$lab_id")) continue;
	if (!is_file("$scores_dir/$lab_id/$student_id")) continue;

	// If the score got recorded, then the source also got saved. Get the lab
        // name (as entered by the user) from there.
        $lab_name = get_lab_name("$sources_dir/$lab_id/$student_id");
                                                           syslog(LOG_INFO, "$sources_dir/$lab_id/$student_id/.lab_name = $lab_name"); ////

	$scores = extract_scores("$scores_dir/$lab_id/$student_id");

	if (!empty($scores))
	    $labs[$lab_name] = $scores;
    }
    //syslog(LOG_INFO, json_encode($labs)); ////
    print json_encode($labs);
}

function extract_scores($score_file) {
    $lines = file($score_file);
    $scores = array();
    foreach ($lines as $line) {
        if (strpos($line, "frozen") !== false || strpos($line, "Frozen") !== false)
            break;
	$toks = explode(",", $line);
	$dt = date("D M j G:i:s T Y", intval($toks[0]));
	array_unshift($scores, array($dt => doubleval($toks[2])));
    }
    return $scores;
}

function get_lab_name($source_dir) {
    //syslog(LOG_INFO, "source = $source_dir");
    $name = strtr(trim(file_get_contents("$source_dir/.lab_name")), "_", " ");;
    if ($name !== "")
       return ucwords($name);

   return "Quest of the great unknown";
}

?>
