<?php
include_once 'utils.php';

main();

function main() {
  $BASE_DIR = "/var/www/quests.nonlinearmedia.org";
  
  $pid = getmypid();

  openlog("q-upload.php", LOG_PID, LOG_LOCAL0);
  header('Content-type: application/json');

  $quest_name = isset($_POST['id'])? $_POST['id'] : "not questing";
                                                                                //syslog(LOG_INFO, "POST = " . json_encode($_POST)); ////

  $uniq_id = "q-" . uniqid();

  $master_dir = "$BASE_DIR/masters/$quest_name";
  if (!is_dir($master_dir)) {
    syslog(LOG_ERR, "Master dir missing: $master_dir");
    $ret = (object) array("error" => 1, "code" => "Master directory missing: " . $master_dir);
    echo json_encode($ret);
    return;
  }
                                                                                //syslog(LOG_INFO, "master_dir = $master_dir"); ////
  $test_dir = "/var/www/quests.nonlinearmedia.org/tests/$uniq_id";
                                                                                //syslog(LOG_INFO, "test_dir = $test_dir"); ////
  if (is_dir($test_dir))
    rrmdir($test_dir);
                                                                                //syslog(LOG_INFO, "mkdir($test_dir)");////
  mkdir($test_dir, 0755, true);
                                                                                //syslog(LOG_INFO, "made $test_dir"); ////
                                                                                //syslog(LOG_INFO, "/bin/pwd; /usr/bin/ls -al $test_dir"); ////

  // Move uploaded files into test dir
  if(!isset($_FILES["file"])) {
    $ret = (object) array("error" => 2, "code" => "No files found");
    echo json_encode($ret);
    rrmdir($test_dir);
    return;
  }
  $error = $_FILES["file"]["error"];

  /* You need to handle both cases if any browser does not support serializing
   * of multiple files using FormData()
   */
  if(!is_array($_FILES["file"]["name"])) { // Single file
    $file_name = $_FILES["file"]["name"];
                                                                                //syslog(LOG_INFO, "Moving the uploaded file to $test_dir/$file_name"); ////
    move_uploaded_file($_FILES["file"]["name"], "$test_dir/$file_name");
  } else { //Multiple files, file[]
    $fileCount = count($_FILES["file"]["name"]);
    for($i = 0; $i < $fileCount; $i++) {
      $file_name = $_FILES["file"]["name"][$i];
                                                                                //syslog(LOG_INFO, "Moving an uploaded file to $test_dir/$file_name"); ////
      move_uploaded_file($_FILES["file"]["tmp_name"][$i], "$test_dir/$file_name");
    }
                                                                                //syslog(LOG_INFO, `/bin/pwd; /usr/bin/ls -al $test_dir/$file_name`); ////
  }

  // Copy over master source files. This should be done *AFTER* the
  // uploaded files have been moved in.
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

  // Finally write the lab name
  file_put_contents("$test_dir/.lab_name", strtr($quest_name, " ", "_"));

  $ret = array('error' => 0, 'code' => "$uniq_id");
                                                                                //syslog(LOG_INFO, json_encode($ret));

  echo json_encode($ret);
}

?>

