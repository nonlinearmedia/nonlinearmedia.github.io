// &: 10/9/19
// Overview of what we're doing:
//  1. Present the user with a text window in which they can enter
//     server log patterns, one per line.
//  2. Send this data as an array of strings (one elem per line)
//     the the remote server (php).
//  3. The php script will look at the last N lines of the actual
//     access_log, and send back a series of numbers encoding the
//     first patterns in the list that match each line (-1 for no match)
//  4. When the results return, we fill in the SS_notes_left_to_play
//     array and invoke ss_play(), which will play the notes one by
//     one until the notes are exhausted.
//

// TODO: We're using a couple of configurable globals for now. Figure out how
// to factor them in later.
var SS_beat_duration = 0.50; // sec
var SS_notes_left_to_play;

function ss_start() {
    var pats = $('#ss_patterns_input').val();
    if (typeof pats === 'undefined' || pats === "") {
        console.log('Nothing in the patterns box');
        return; // Don't bug noaa unless you're actually looking for something
    }

    //var url = "https://services.swpc.noaa.gov/text/goes-magnetospheric-particle-flux-ts1-primary.txt"
    var url = "https://services.swpc.noaa.gov/text/ace-swepam.txt"

    $.get(url, function(res) {
        SS_notes_left_to_play = ss_process_noaa_response(res);
        if (typeof SS_notes_left_to_play === 'undefined')
            return;
        ss_play_notes_in_queue(); // Will empty SS_notes_to_play
    });
}

// SS_notes_left_to_play is an array of numbers. These numbers are
// the indices of the first of our patterns to match each line
// (note - all unmatched lines would have been eaten).
// We translate that into audio by playing the (n % 6)th note
// (cuz we only have 6 notes)
//
// Infinite-cycle through the beats in the beat_str until all returned
// notes have been exhausted. If a bit is 0, we skip setting a
// play for that beat. Else we schedule the next note in the returned
// array for playing and go on to the next beat.
//        
function ss_play_notes_in_queue() {
    if (SS_notes_left_to_play.length == 0) {
        this.beat_counter = 0;
        console.log('next song in 2s');
        setTimeout(ss_start, 2000);      // Schedule restart (don't invoke)
        return;
    }
    
    if (typeof this.beat_counter == 'undefined')
        this.beat_counter = 0;

    ss_play_drum_beat(this.beat_counter);
    var beat_str = $('#ss_beats_selector').val().replace(/ /g, "");

    var beat = beat_str[this.beat_counter % beat_str.length];
    ++this.beat_counter;
    
    if (beat != "0") {
        var note_to_play = SS_notes_left_to_play.shift();

        // If you move this function outside the loop, users can't change
        // the raga at run-time (if you provide control)
        var available_sounds = ss_get_sounds_from_current_scale();
        
        var sound_id = available_sounds[note_to_play % available_sounds.length];
        var sound_file = 'aud/' + sound_id + '.mp3';
        ss_play(sound_file);
    }
    setTimeout(ss_play_notes_in_queue, SS_beat_duration * 1000);
}

// Return an array of sound names determined by the scale of
// the named raga. By default, return sankarabaranam (cmaj)
//
function ss_get_sounds_from_current_scale() {
    var scales_from = {
        "hindolam"        : [ 'sa2', 'ga2', 'ma2', 'da2', 'ni2', 'sa3' ],
        "sivaranjani"     : [ 'sa2', 'ri2', 'gu2', 'pa2', 'da2', 'sa3' ], // hindustani version
        "mohanam"         : [ 'sa2', 'ri2', 'ga2', 'pa2', 'da2', 'sa3' ],
        "malahari"        : [ 'sa2', 'ru2', 'ga2', 'ma2', 'pa2', 'du2', 'sa3' ],
        "shankarabaranam" : [ 'sa2', 'ri2', 'ga2', 'ma2', 'pa2', 'da2', 'ni2', 'sa3' ]
    };

    var scale_str = $('#ss_scale_selector').val();
    var scale = scales_from[scale_str];
    if (typeof scale === 'undefined')
        return scales_from["shankarabaranam"];
    return scale;
}

// Play the note
function ss_play(sound_file) {
    console.log('playing ' + sound_file); ////
    var aud = new Audio(sound_file);
    if (!aud) {
        console.log("Couldn't open " + sound_file);
        return;
    }
    
    var promise = aud.play();
    if (promise !== undefined) {
        promise.then(_ => {}).catch(_ => {
                console.log('ss_play(' + sound_file + ') failed');
        });
    }
}

// Play one of our drum beats (dum1... dum7) selected by cycling through
// the selected drum_beat_seq string. You can surface this to the user too.
function ss_play_drum_beat(beat_count) {
    var drum_beat_seq_str = "3010102000";

    var drum_beat = drum_beat_seq_str[beat_count % drum_beat_seq_str.length];
    if (drum_beat != "0")
        ss_play('aud/dums/dum' + drum_beat + '.mp3');
}

// ----------------------------------------------------------------------
// This is the major change for starsong (from serversong)
// Process the data from noaa into a series of discretized slope values
//
function ss_process_noaa_response(noaa_resp) {
    var LO_THRESHOLD = 0.2, HI_THRESHOLD = 100*1000;
    
    var lines = noaa_resp.split('\n');
    if (typeof lines === 'undefined')
        return;

    var prev_val = 'undefined';
    var slopes = [];
    var least = 'undefined', most = 'undefined';
    for (var i = 0; i < lines.length; i++) {
        // Skip lines that begin with : or #
        var line = lines[i];
        if (line.startsWith(':') || line.startsWith('#'))
            continue;
        var toks = line.split(/\s+/);
        if (toks.length < 8) // P1 is in col 8
            continue;
        curr_val = parseFloat(toks[7]);
        if (prev_val == 'undefined') {
            least = most = prev_val = curr_val;
            continue;
        }
        if (curr_val < LO_THRESHOLD) // Out of band low, not tracked
            slopes.push('LOW');
        else if (curr_val < least) {
            slopes.push('LEAST');
            least = curr_val;
        }
        else if (curr_val > HI_THRESHOLD)
            slopes.push('HIGH');
        else if (curr_val > most) {
            slopes.push('MOST');
            most = curr_val;
        }
        else if (curr_val > prev_val)
            slopes.push('MORE');
        else if (curr_val < prev_val)
            slopes.push('LESS');
        else
            slopes.push('SAME');

        prev_val = curr_val;
    }

    // Now fetch the text box contents and tranlsate these into numbers
    var patterns_str = $('#ss_patterns_input').val();
    var patterns = patterns_str.trim().split('\n');
    if (patterns.length > 0 && patterns[0].includes( "(or edit below first)" ))
        patterns.shift();

    out = [];
    for (var i = 0; i < slopes.length; i++) {
        for (var j = 0; j < patterns.length; j++) {
            if (slopes[i].toUpperCase().indexOf(patterns[j].toUpperCase()) !== -1) {
                out.push(j);
                break;
            }
        }
    }

    return out;
}

// Set up hover help
$(document).ready(function() {
    $(document.body).fadeIn();
    $('#ss_help_icon').hover(
        function() {
            $('#ss_help_panel').fadeIn();
            },
        function() {
            $('#ss_help_panel').fadeOut();
            }
        );
    });
