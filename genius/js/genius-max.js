// Genius entry screen

// Globals start with GM
var GM_ok_mp3 = new Audio('/genius/aud/yes.mp3')
var GM_nok_mp3 = new Audio('/genius/aud/no.mp3')
var GM_enter_chime = new Audio('/genius/aud/enter-chime.mp3')
var G_boom_ba_mp3 = new Audio('/genius/aud/g-boom-ba.mp3')

// ---------- Utils
function gm_play_sound(audio) {
  var promise = audio.play()
  if (promise !== undefined)
    promise.then(_ => {}).catch(_ => {})
}

// Just for fun. Jumble the word bootcamp in the info panel
function gm_get_bootcamp_spelling() {
    var s = [ "Boomcapt", "Pootcamb", "Poatcomb", "Coatpomb", "Tacobomp", "Pambcoot", "Pombcoat", "Coatbomp" ]

    if (Math.random() < 0.5) return "Bootcamp"
    return s[Math.floor(s.length * Math.random())]
}

// Countdown to bootcamp
function gm_start_countdown() {
    var _second = 1000, _minute = 60*_second, _hour = 60*_minute, _day = 24*_hour
    var timer

    function _update_countdown() {
        var time_left = (new Date('Aug 1, 2023') - new Date())
        if (time_left < 0) {
            clearInterval(timer)
            $('#gm-countdown').text = "This Bootcamp has started"
            return
        }
        var days = Math.floor(time_left/_day)
        var hours = Math.floor((time_left%_day)/_hour)
        var minutes = Math.floor((time_left%_hour)/_minute)
        var seconds = Math.floor((time_left%_minute)/_second)

        $('#gm-countdown').text(days + " days, " + hours + " hours, " + minutes + " min, " + seconds + "s left")
    }

    timer = setInterval(_update_countdown, 1000)
}


// ---------- Handlers

/* Primary handler for the YN question in the big circle
 */
var GM_prev_contents = null
var GM_yn_button_is_armed = false;

function gm_arm_yn_button() {
    gm_play_sound(GM_ok_mp3)
    $('#gm-yn-div').addClass('gm-yn-ok')
    $('#gm-yn-input').addClass('gm-yn-ok')
    GM_yn_button_is_armed = true
}    
function gm_disarm_yn_button() {
    gm_play_sound(GM_nok_mp3)
    $('#gm-yn-div').removeClass('gm-yn-ok')
    $('#gm-yn-input').removeClass('gm-yn-ok')
    GM_yn_button_is_armed = false
}    

function gm_yn_font_resize() {
    var yn = $('#gm-yn-input').val()

    // At (33px,12px) you can fit (25,60) chars in the box.
    var size = yn.length <= 20 ? 33 : (33 - (yn.length-20)*0.5)
    if (size < 12) size = 12
    $('#gm-yn-input').css('font-size', size + 'px')
}

function gm_onkeyup_yn(e) {
    var KEY_ESC = 27, KEY_CR = 13, KEY_NL = 10
    if (e == null) return

    var answer = $('#gm-yn-input').val().trim().toLowerCase()

    if (e.which == KEY_ESC && $('#gm-yn-input').val() != "") {
        $('#gm-yn-input').val("")
        answer = ""
        gm_disarm_yn_button()
    }
    
    else if (e.which == KEY_CR || e.which == KEY_NL) {
        if (!GM_yn_button_is_armed)
            return;
        
        $('#gm-bootcamp').text(gm_get_bootcamp_spelling())
        if (answer == "yes")
            $('#gm-yn-feedback').html('YES was the correct answer.<br>Have fun questing with other Geniuses!<br><br>')
        else
            $('#gm-yn-feedback').html('NO was the WRONG answer.<br>Find out why by joining other Geniuses having fun.<br><br>')
        
        gm_play_sound(GM_enter_chime)
        gm_show_name_email_div()
    }

    else {
        if ((answer == "yes" || answer == "no") && (GM_prev_contents != "yes" && GM_prev_contents != "no"))
            gm_arm_yn_button()
        else if ((answer != "yes" && answer != "no") && (GM_prev_contents == "yes" || GM_prev_contents == "no"))
            gm_disarm_yn_button()
    }

    // Size the font per the length of the text
    gm_yn_font_resize()
    GM_prev_contents = answer
}

// ----------------------------------------------------------------------
// Z-index 2
// Name/email input related functions

// The following is to handle name/email validity and corresponding UI changes
var GM_name_email_button_armed = false

function gm_email_is_valid() {
    var email = $('#gm-email').val()
    if (!email) return false

    // pattern from https://www.w3resource.com/javascript/form/email-validation.php
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}
function gm_name_is_valid() {
    return ($('#gm-name').val().trim() != "")
}

function gm_arm_button() {
    gm_play_sound(GM_ok_mp3)
    $('#gm-name-email-entry-div').addClass('gm-entry-ok')
    $('#gm-name').addClass('gm-valid-name')
    $('#gm-email').addClass('gm-valid-email')
    GM_name_email_button_armed = true
}

function gm_disarm_button() {
    gm_play_sound(GM_nok_mp3)
    $('#gm-name-email-entry-div').removeClass('gm-entry-ok')
    $('#gm-name').removeClass('gm-valid-name')
    $('#gm-email').removeClass('gm-valid-email')
    GM_name_email_button_armed = false
}

function gm_button_check() {
    if (gm_email_is_valid() && gm_name_is_valid()) {
        if (!GM_name_email_button_armed) {
            gm_arm_button()
            GM_name_email_button_armed = true
        }
    } else {
        if (GM_name_email_button_armed) {
            gm_disarm_button()
            GM_name_email_button_armed = false
        }
    }
}

function gm_name_email_font_resize() {
    // at 24 px you can fit about 18 chars in the box. More means needs shrinking
    var name_len = $('#gm-name').val().length
    var name_size = name_len <= 18 ? 24 : (24*18/name_len)
    $('#gm-name').css('font-size', name_size + 'px')

    // Dito for email
    var email_len = $('#gm-email').val().length
    var email_size = email_len <= 18 ? 24 : (24*18/email_len)
    $('#gm-email').css('font-size', email_size + 'px')
}

function gm_onkeyup_email(e) {
    var KEY_ESC = 27, KEY_CR = 13, KEY_NL = 10
    if (e == null) return

    if (e.which == KEY_ESC && $('#gm-email').val() != "") {
        $('#gm-email').val("")
        gm_disarm_button()
        return
    }

    else if (e.which == KEY_CR || e.which == KEY_NL) {
        if (GM_name_email_button_armed)
            gm_process_rego()
    } else { // Regular char
        gm_button_check()
    }

    // Size the font per the length of the text
    gm_name_email_font_resize()
}

function gm_onkeyup_name(e) {
    var KEY_ESC = 27, KEY_CR = 13, KEY_NL = 10
    if (e == null) return

    if (e.which == KEY_ESC && $('#gm-name').val() != "") {
        $('#gm-name').val("")
        gm_disarm_button()
        return
    }

    else if (e.which == KEY_CR || e.which == KEY_NL) {
        if (GM_name_email_button_armed)
            gm_process_rego()
    } else { // Regular char
        gm_button_check()
    }

    // Size the font per the length of the text
    gm_name_email_font_resize()
}

// Do the AJAX call with name/email
function gm_process_rego() {
    gm_play_sound(G_boom_ba_mp3)

    var name  = $('#gm-name').val().trim()
    var email = $('#gm-email').val().trim().toLowerCase()

    ////gm_show_rego_status(1729)

    // Results from this ajax call will be like:
    // { n: 1729 } where 1729 is the waiting list number.
    url = "/genius/php/gm-process-applicant.php"
    param = { "n": name, "e" : email }

    $.post(url, param, function(res) {
        var json = JSON.parse(res)
        gm_show_rego_status(json == null || json.n <= 0 ? 1729 : json.n)
    })
}

// ---------- Ready
$(document).ready(function() {
    $('body').fadeIn()

    $('#gm-yn-input').focus()

    // the yes/no question on the home page - keyup
    $('#gm-yn-input').keyup(gm_onkeyup_yn)

    // the name and email on the rego page (keyup) and the red X (click)
    $('#gm-name').keyup(gm_onkeyup_name)
    $('#gm-email').keyup(gm_onkeyup_email)

    // Who be da Genii?
    $('#gm-genii').click(function() { gm_show_genii() })

    $('#gm-name-email-overlay-x').click(function() { gm_dismiss_name_email_div() })
    $('#gm-rego-status-overlay-x').click(function() { gm_dismiss_rego_status() })    // Red X on waitlist results page
    $('#gm-genii-overlay-x').click(function() { gm_dismiss_genii() })

    gm_start_countdown()
})

// Show unshow functions ----------------------------------------------

function gm_show_name_email_div() {
    $('#gm-yn-input').prop('disabled', true)
    $('#gm-name-email-overlay').fadeIn(1500)
    $('#gm-name').focus()
}
function gm_dismiss_name_email_div() {
    $('#gm-yn-input').prop('disabled', false)
    $('#gm-name-email-overlay').fadeOut()
}

function gm_show_rego_status(n) {
    if (n < 0) {
        alert('Oops! Something went wrong. Please contact the administrators. Thanks')
        return
    }

    $('#gm-waitlist-number').text('#' + n)

    // Disable name/email inputs
    $('#gm-name').prop('disabled', true)
    $('#gm-email').prop('disabled', true)
    $('#gm-rego-status-overlay').fadeIn()
}
function gm_dismiss_rego_status() {
    $('#gm-rego-status-overlay').fadeOut()
    $('#gm-name').prop('disabled', false)
    $('#gm-email').prop('disabled', false)
}    

function gm_show_genii() {
    $('#gm-genii-overlay').fadeIn()
}
function gm_dismiss_genii() {
    $('#gm-genii-overlay').fadeOut()
}    
