<?php

main();

function main() {
    // This dir is on EFS and will survive crashes
    $logfile = "/var/www/quests.nonlinearmedia.org/logs/grady-log.csv";

    // Received json:
    // {"i":this.game_id, "x":x, "y":y, "m":this.min, "n":guess_num, "t":Date.now()}

    $id =  isset($_POST['i'])  ? $_POST['i'] : "no id";
    $x = isset($_POST['x'])  ? $_POST['x'] : "no x";
    $y = isset($_POST['y'])  ? $_POST['y'] : "no y";
    $guess_num = isset($_POST['n'])  ? $_POST['n'] : "no guess_num";
    $ts = isset($_POST['t'])  ? $_POST['t'] : "unknown time";
    
    $csv = "$id,a,$ts,$guess_num,$x,$y"; // the "a" stands for "attempt" log
    $fp = fopen($logfile, "a");

    if (flock($fp, LOCK_EX)) {
	fwrite($fp, "$csv\n");
	fflush($fp);
	flock($fp, LOCK_UN);
    } else {
	syslog(LOG_INFO, "grady logit_a couldn't get lock on $logfile");
    }
}
