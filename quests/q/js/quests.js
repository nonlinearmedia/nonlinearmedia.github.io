var ct_quests_idle_time = 0;

function _quests_show_data() {
    var id = document.getElementById('idbox').value;

    // Skip if id has funny chars
    if (id.match(/[^-.0-9A-Za-z_@]/))
        return;

    //Pop up the quests panel when the data returns.
    $.post('php/get-scores.php', { 'i' : id })
        .done(function(res) {
            var s = format_quest_scores(res);
            $('#quests_table_div').html(s);
            $('#idbox').val("");
            _quests_unhide_quests_div();
        })
    ;
}

function _quests_on_key_up_id_box(e) {
    var KEY_ESC = 27, KEY_CR = 13, KEY_NL = 10, KEY_UP = 38, KEY_DOWN = 40;
    if (e != null && (e.keyCode == KEY_CR || e.keyCode == KEY_NL)) {
        _quests_show_data();
    }
}

function _quests_hide_quests_div() {
  $('#quests_div').fadeOut();
}

function _quests_unhide_quests_div() {
  $('#quests_div').fadeIn();
}

// {"duck":[{"Thu Jul 4 8:23:26 PDT 2019":22},{"Thu Jul 4 8:21:59 PDT 2019":0},{"Thu Jul 4 8:10:59 PDT 2019":0}],"mouse":[{"Tue Aug 6 8:40:55 PDT 2019":19},{"Tue Aug 6 8:39:57 PDT 2019":19},{"Thu Jul 4 20:43:11 PDT 2019":19}],"tiger":[{"Wed Aug 7 14:05:53 PDT 2019":1}]}

function format_quest_scores(res) {
    var total = 0;
    var str = "<h2>Your Past Quests</h2>";
    str += "<table id=quests_table><tr><th>Quest</th><th>Most Recent Attempt</th><th>Trophies</th></tr>";
    for (var lab_name in res) {
	var submission = res[lab_name][0]; // Most recent sub for lab_name
	
	str += '<tr><td>' + lab_name + '</td>';

        // Note - submission should only have 1 elem for the most recent ts
	for (var ts in submission) {
	    total += submission[ts];
	    str += '<td class=quests_ts>' + ts + '</td><td>' + submission[ts] + '</td></tr>';
	    // TODO - bind a function to the ts to open up the full quest attempt trail on hover
        }
    }
    str += "</table>"
	+ "<p id=quests_total_trophies>You have a total of " + total + " trophies</p>"
	+ "<p>That'd be all m'lords and ladies</p>";

    return str;
}

function ct_quests_idle_time_update() {
    ct_quests_idle_time += 5;
    if (ct_quests_idle_time > 10) {// 20s idle
        $('#quests_div').fadeOut(5000);
    }   
}

$(document).ready(function () {
    setInterval(ct_quests_idle_time_update, 5000); // Increment every 5s

    $(this).mousemove(function (e) {
        ct_quests_idle_time = 0;
    });
    $(this).keypress(function (e) {
        ct_quests_idle_time = 0;
    });

    //set focus to first input box
    $('#idbox').focus();
    $("#idbox:text:visible:first").focus();
});
