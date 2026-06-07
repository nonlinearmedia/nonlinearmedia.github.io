<?php
header("Access-Control-Allow-Origin: *");

main();

function main() {
    $titles = array(
        "Your Cloud Quest", "Your Quest Cloud", "Quest Your Cloud", "Cloud Your Quest"
    );
    $random_title = $titles[rand() % count($titles)];

    $id = isset($_GET['id']) ? $_GET['id'] : "a patient panda";

    $page = file_get_contents("q-cloud.html");
    $page = str_replace('_q_id_placeholder_', $id, $page);

    $page = str_replace('_q_title_placeholder_', $random_title, $page);

    echo $page;
}
?>
