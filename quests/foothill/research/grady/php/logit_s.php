<?php

main();

function main() {
    // This dir is on EFS and will survive crashes
    $logfile = "/var/www/quests.nonlinearmedia.org/logs/grady-log.csv";

    // Received json:
    // var param = {
    //    var param = {
    //        "i":this.game_id, "p":this.player_self_selected_type, "g":game_type, "l":this.level,
    //        "a":this.a, "b":this.b, "c":this.c, "m": this.min,"t":Date.now()
    //   }

    $id =  isset($_POST['i'])  ? $_POST['i'] : "no id";
    $player_type = isset($_POST['p'])  ? $_POST['p'] : "no player type";
    $game_type = isset($_POST['g'])  ? $_POST['g'] : "no game_type";
    $level = isset($_POST['l'])  ? $_POST['l'] : "no level";

    $a = isset($_POST['a'])  ? $_POST['a'] : "no a";
    $b = isset($_POST['b'])  ? $_POST['b'] : "no b";
    $c = isset($_POST['c'])  ? $_POST['c'] : "no c";
    $min = isset($_POST['m'])  ? $_POST['m'] : "no min";
    $ts = isset($_POST['t'])  ? $_POST['t'] : "unknown time";
    
    $csv = "$id,s,$ts,$player_type,$game_type,$level,$a,$b,$c,$min"; // the "s" stands for "start" log
    $fp = fopen($logfile, "a");

    if (flock($fp, LOCK_EX)) {
	fwrite($fp, "$csv\n");
	fflush($fp);
	flock($fp, LOCK_UN);
    } else {
	syslog(LOG_INFO, "grady logit_a couldn't get lock on $logfile");
    }
}
