<?php

// This dir is on EFS and will survive crashes
$logfile = "/var/www/quests.nonlinearmedia.org/logs/grady-log.csv";

$lines = file($logfile);
echo "<PRE>", implode($lines), "</PRE>";

?>
