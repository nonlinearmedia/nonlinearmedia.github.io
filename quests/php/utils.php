<?php

// We always exit 0 to prevent a server error. The actual
// error must be put into the JSON by the calling php

function q_clean_up_and_exit($dir) {
  rrmdir($dir);
  exit(0); 
}

function rrmdir($dir) { 
  if (is_dir($dir)) { 
    $objects = scandir($dir); 
    foreach ($objects as $object) { 
      if ($object != "." && $object != "..") { 
        if (is_dir($dir."/".$object))
          rrmdir($dir."/".$object);
        else
          unlink($dir."/".$object); 
      } 
    }
    rmdir($dir); 
  } 
}

?>
