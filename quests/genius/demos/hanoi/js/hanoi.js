/**
 * The largest disc is 100px wide. Smaller discs are 10% (0.9x) the width of their next
 * biggest one.
 *
 * The poles are at relative positions (x-coords) 150, 500, and 750 resp.
 */
var _HANOI_DIV_WIDTH = 900;
var _HANOI_DIV_HEIGHT = 300;
var _HANOI_MAX_DISCS = 20;

var _Hanoi_View;

function onBodyLoad() {
}

function onRuleInputKeyUp(ev) {
    var NL = 10, CR = 13;

    var keyCode = ('which' in ev)? ev.which : ev.keyCode;
    if (keyCode != NL && keyCode != CR) return;

    var e = document.getElementById('_hanoi_nDiscs');
    var nDiscsStr = e.value.trim();

    if (nDiscsStr == "") return;
    var nDiscs = parseInt(nDiscsStr);

    if (isNaN(nDiscs) || nDiscs < 0 || nDiscs > _HANOI_MAX_DISCS) {
	alert('Number of discs must be a number (duh!) between 0 and " + _HANOI_MAX_DISCS + " (inclusive)');
	e.value = "10";
	return;
    }
    hanoi_start(nDiscs);
}

function hanoi_start(nDiscs) {
    $('#_hanoi_container').html("");  // Clear
    
    _Hanoi_View = new HanoiView('_hanoi_container', _HANOI_DIV_WIDTH, _HANOI_DIV_HEIGHT, nDiscs);
    if (_Hanoi_View == null) {
	alert("Something is wrong. Couldn't instantiate a View");
	return;
    }

    // Move nDiscs from pole 0 to pole 2 using pole 1 as a holding area
    disableInputs();
    move(nDiscs, 0, 2, 1);
    setTimeout(_Hanoi_View.animate, 1500); // Start after a 1.5s delay
}

function move(nDiscs, src, dst, tmp) {
    if (nDiscs < 2) {
	_Hanoi_View.enqueueMove(src, dst);
	return;
    }
    move(nDiscs-1, src, tmp, dst);
    move(1, src, dst, tmp);
    move(nDiscs-1, tmp, dst, src);
}

function onClickLuckyButton() {
    var nDiscs =  Math.floor(Math.random() * (_HANOI_MAX_DISCS-2)) + 2;
    document.getElementById('_hanoi_nDiscs').value = nDiscs;
    hanoi_start(nDiscs);
}

function enableInputs() {
    document.getElementById('_hanoi_luckyButton').disabled = false;
    document.getElementById('_hanoi_nDiscs').disabled = false;
}

function disableInputs() {
    document.getElementById('_hanoi_luckyButton').disabled = true;
    document.getElementById('_hanoi_nDiscs').disabled = true;
}
