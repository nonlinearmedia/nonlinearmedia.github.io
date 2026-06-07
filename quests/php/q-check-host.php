<?php

// This script is invoked by ct-cloud-src.js to dynamically
// verify the currently displaying hostname in the text input box
//
main();

// Simple host validity check - no fancy stuff.
//  check if hostname resolves. If not return false
//  decided against doing a fetch / here (9/29) - so only dns check.

function main() {
    $url = isset($_GET['u']) ? $_GET['u'] : "";

    if (substr($url, 0, 4) != 'http')
	$url = "http://$url";

    $host = parse_url($url, PHP_URL_HOST);
    
    if (!$host) {
	echo json_encode((object) array('e'=>1)); // no hostname
	return;
    }

    // There seems to be a bug in gethostbyname(). It maps 1.1 to 1.0.0.1 - is this legit?
    $res = gethostbyname($host);
    if (is_ip($res)) {
	echo json_encode((object) array('e'=>0, 'r'=>$res, 'h'=>$host));
	return;
    }
    echo json_encode((object) array('e'=>2)); // no ip
}


// ----------------------------------------------------------------------

// from stackoverflow, Tomgrohl
function is_ip($ip = null) {
    if(!$ip or strlen(trim($ip)) == 0) {
        return false;
    }

    $ip=trim($ip);
    if(preg_match("/^[0-9]{1,3}([.][0-9]{1,3}){3}$/",$ip)) {
        $blocks = explode(".", $ip);
	if (sizeof($blocks) != 4) return false;
        foreach($blocks as $block)
            if($block<0 || $block>255)
                return false;
        return true;
    }
    return false;
}

?>
