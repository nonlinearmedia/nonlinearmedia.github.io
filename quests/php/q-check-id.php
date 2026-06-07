<?php

main();

// Simple id validity check - no mysql required. Just see
// if ../data/tests/masters/[id] exists, is a directory and
// contains a non-zero length file named spec.pdf
//
// 9/27: Further, if the dir exists, and contains a file called
// .input_mode, and it contains the word text, then the &i=t 
// flag will be added to the GET list.
//
// Just picking some arbitrary guessed size for a
// minimally valid pdf.
//
function main() {
  $BASE_DIR = "/var/www/quests.nonlinearmedia.org";
  
  $id = isset($_POST['id']) ? $_POST['id'] : "the legend of fangs";
    
  $master_dir = "$BASE_DIR/masters/$id";
  $spec_file = "$master_dir/spec.pdf";
  $lore_id_file = "$master_dir/.lore_id";
  $input_mode_file = "$master_dir/.input_mode";

  if (!is_dir($master_dir)) {
    echo json_encode((object) array('e'=>1));
    return;
  }

  $input_mode = 'd'; // D&D by default
  if (is_file($input_mode_file)) {
    $input_mode = file_get_contents($input_mode_file);
    if (strpos($input_mode, 'text') !== false)
      $input_mode = 't';  // Text (cloud)
    else if (strpos($input_mode, 'lore') !== false)
      $input_mode = 'l';  // Lore
    else
      $input_mode = 'd';  // D&D
  }

  if ($input_mode == 'l' && is_file($lore_id_file)) {
    $lore_id = trim(file_get_contents($lore_id_file));
    echo json_encode((object) array('e'=>0, 'i'=>$input_mode, 'l'=>$lore_id));
    syslog(LOG_INFO, "Redirected to Lores: $id");////
    return;
  }

  // Both cloud and Prog code tests require a spec file
  if (!is_file($spec_file))
    echo json_encode((object) array('e'=>2));
  else if (filesize($spec_file)  < 10000)
    echo json_encode((object) array('e'=>3));
  else    // All clear
    echo json_encode((object) array('e'=>0, 'i'=>$input_mode));
}
