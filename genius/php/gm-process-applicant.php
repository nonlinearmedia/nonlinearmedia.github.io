<?php

main();

class Record {
    var $name;
    var $timestamp;
    var $rank;
}

function main() {
    $name =  isset($_POST['n'])  ? $_POST['n'] : "no name";
    $email = isset($_POST['e'])  ? $_POST['e'] : "no email";
    //$name = "bubba"; ////
    //$email = "9@bubba.com"; ////

    // This dir is on EFS and will survive crashes
    $datafile = "/var/www/quests.nonlinearmedia.org/subs/scores/genius/waitlist.tsv";

    // Read the file into a hash
    $result = get_waitlist_records($datafile);
    $max_rank = $result[0];
    $records = $result[1];

    //print_r($records); ////

    syslog(LOG_INFO, "Genius email check: $email, $name");
    if (array_key_exists($email, $records)) {
        $rec = $records[$email];
        echo json_encode((object) array('n'=>$rec->rank));
    } else {
        $ts = time();

        // Thanks to Oliver
        if (!$fp = fopen($datafile, "a")) {
            syslog(LOG_ERR, "Cannot open file ($datafile) for append");
            echo json_encode((object) array('n'=>1729));
            exit();
         }
        flock($fp, LOCK_EX);
        fwrite($fp, "$name\t$email\t$ts\n");
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        syslog(LOG_INFO, "added to Genius waitlist: $email, $name");
        echo json_encode((object) array('n'=>$max_rank+1));
    }
}

function get_waitlist_records($datafile) {
  $records = array();

  $lines = file($datafile); // TODO check thread safety
  $n = 0;
  $max_rank = 0;
  foreach ($lines as $line) {
      $line = rtrim($line);
      if (strlen($line) == 0) continue;
      ++$n;

      if ($line[0] == '!') {
          continue; // exclude
      }

      $fields = explode("\t", $line);
      if (count($fields) != 3) continue;

      $name = $fields[0];
      $email = $fields[1];
      $timestamp = $fields[2];
      $rank = $n;
      if ($rank > $max_rank)
          $max_rank = $rank;

      $record = new Record();
      $record->name = $name;
      $record->timestamp = $timestamp;
      $record->rank = $rank;
      $records[$email] = $record;
  }

  return array($max_rank, $records);
}

