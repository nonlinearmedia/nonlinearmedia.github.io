<?php

// Return lore text to be displayed. This script is only relevant to my
// Questing site (entry through password). Otherwise a cache id
// would have been supplied, which takes the JS directly to cloudfront.
//
// Quick overview: Basically, there's two ways to get a lore
// One way (the public way) is with id=$cache_id, which fetches the
// precompiled lore from the cloudfront cache. For the questing site, I
// provide a special alternative (to enter by questing id).
//
// Note: input lines can have newlines in them.
//
main();

function tr_unescape_slashes($str) {
    return str_replace('\/', '/', $str);
}

function main() {
  $BASE_DIR = "/var/www/quests.nonlinearmedia.org";

  date_default_timezone_set('America/Los_Angeles');
  $pid = getmypid();

  openlog("tr_lore_get_text.php", LOG_PID, LOG_LOCAL0);
  header('Access-Control-Allow-Origin: *');
  header('Content-type: text/json');
  
  $id = isset($_POST['id']) ? $_POST['id'] : "";
  if ($id == "") $id = "the legend of fangs"; ////

  // Shouldn't be the case, but just to make sure, if id matches a hash...
  if (preg_match("/^[a-z0-9]{32}$/", $id) == 1) {
      syslog(LOG_INFO, "Cache hit for $id. Shunting call to cloudfront.");

      $cache_url = 'https://d3q0lkk268h629.cloudfront.net/cache/' . $id;
      syslog(LOG_INFO, "Fetching $cache_url");

      $data = json_decode(file_get_contents($cache_url)); // will be  dict
      if ($data)
          $ret = (object) array("error" => 0, "data" => $data);
      else 
          $ret = (object) array("error" => 1, "data" => stdClass);

      syslog(LOG_INFO, "ret = " . json_encode($ret)); ////

      echo tr_unescape_slashes(json_encode($ret));
      return;
  }

  // Else assume it's not an md5 (must be a lore name)
  $lore_id = $id;
  
  if ($lore_id == "") {
    syslog(LOG_ERR, "Lore name turned up empty in tr_get_lore.php. Take a look.");
    $ret = (object) array("error" => 1, "data" => "Oops! Your legend vanished. I'll look into this. Sorry.");
    echo json_encode($ret);
    return false;
  }

  // The master dir should have two files: lore.txt (which will go into resp.data.in.lines)
  // and speaker-map.json (which will go in resp.data.in.speaker_map)
  // subtitle = id, and title is simply "Questing Lores"
  //
  $master_dir = "$BASE_DIR/masters/$lore_id";

  if (!is_dir($master_dir)) {
    $ret = (object) array("error" => 1, "data" => "Alas! 1 lore is surprisingly missing");
    echo json_encode($ret);
    return;
  }

  $lore_text = file_get_contents("$master_dir/lore.txt");
  $lines = explode("\n", $lore_text);

  $speaker_map = json_decode(file_get_contents("$master_dir/speaker-map.json"));
  $subtitle = '<span id="tr_lore_id">' . $lore_id . '</span>';
  $ret = (object) array(
    'error' => 0,
    'data' => (object) array(
        "in" => (object) array(
            'lines' => $lines,
            'title' => 'Questing Lores',
            'subtitle' => $subtitle,
            'speaker_map' => $speaker_map,
            'polly_packets' => array()
        ),
        "out" => (object) array(
            'audio_objects' => array()
        )
    )
  );
  $out = tr_unescape_slashes(json_encode($ret));

  //syslog(LOG_INFO, $out); ////
  echo $out;
}

