<?php

// Called from JS to obtain the spec.pdf file for a particular lab
// as a byte stream (GET param id)

main();

function main() {
  $BASE_DIR = "/var/www/quests.nonlinearmedia.org";

  header('Cache-control: private');
  header('Content-Type: application/pdf');
  header('Access-Control-Allow-Origin: *');

  $id = isset($_GET['id']) ? $_GET['id'] : "";
  
  $filename = "$BASE_DIR/masters/$id/spec.pdf";

  if (!is_file($filename)) {
    $filename = "/var/www/html/pdf/404.pdf";
    $display_filename = "404.pdf";
  }

  header("Content-Length: " . filesize($filename));

  readfile($filename);
}
