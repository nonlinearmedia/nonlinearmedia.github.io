<?php

$datafile = "/var/www/quests.nonlinearmedia.org/subs/scores/genius/waitlist.tsv";

$lines = file($datafile);
echo "<PRE>", implode($lines), "</PRE>";

?>
