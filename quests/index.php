<?php
header("Access-Control-Allow-Origin: *");

main();

function main() {
    $titles = array(
        "Your Clore Quest", "Your Quest Clore", "Quest Your Clore", "Clore Your Quest"
    );
    $random_title = $titles[rand() % count($titles)];

    $quests = array(
        "A Tiger Named Fangs" ,    // c++
        "A Lion Called Mousehart", // Java
        "A Tadpole Dancing",       // Cloud
        "The Legend of Fangs"      // Lores
    );
    $placeholder_quest = $quests[rand() % count($quests)];

    if (isset($_GET['id']))
        $placeholder_quest = $_GET['id'];

    $page = file_get_contents("q-enter.html");
    $page = str_replace('_q_title_placeholder_', $random_title, $page);
    $page = str_replace('_q_id_placeholder_', $placeholder_quest, $page);
                    
    echo $page;
}
?>
