<?php

main();

function main() {
    // This dir is on EFS and will survive crashes
    $logfile = "/var/www/quests.nonlinearmedia.org/logs/grady-log.csv";

    // Received json:
    // "i":this.game_id, "a":this.a, "b":this.b, "c":this.c, "n":this.num_guesses,"o":outcome, "t":Date.now()

    $id =  isset($_POST['i'])  ? $_POST['i'] : "no id"; // game id
    $num_guesses = isset($_POST['n'])  ? $_POST['n'] : "no num_guesses";
    $outcome = isset($_POST['o'])  ? $_POST['o'] : "no outcome";
    $ts = isset($_POST['t'])  ? $_POST['t'] : "unknown time";

    // the "f" stands for "final" log for this game
    $csv = "$id,f,$ts,$num_guesses,$outcome";
    $fp = fopen($logfile, "a");

    if (flock($fp, LOCK_EX)) {
	fwrite($fp, "$csv\n");
	fflush($fp);
	flock($fp, LOCK_UN);
    } else {
	syslog(LOG_INFO, "grady logit_a couldn't get lock on $logfile");
    }
}
