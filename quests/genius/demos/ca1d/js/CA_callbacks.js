/* Global Viewport and Controller used by all CA
 * &: 9/26/14
 */
var View;

function onBodyLoad() {
    View = new CA_View('_ca_container', 1001, 600);
    if (View == null) {
        alert("Something is wrong. I couldn't instantiate a Viewport");
        return;
    }
}

function onRuleInputKeyUp(ev) {
    var NL = 10, CR = 13;

    var keyCode = ('which' in ev)? ev.which : ev.keyCode;
    if (keyCode != NL && keyCode != CR) return;

    var e = document.getElementById('_ca_ruleNum');
    var ruleStr = e.value.trim();

    if (ruleStr == "") return;
    var ruleNum = parseInt(ruleStr);

    if (isNaN(ruleNum) || ruleNum < 0 || ruleNum > 256) {
      alert('Rule number must be a number (duh!) between 0 and 255 (inclusive)');
      e.value = "150";
      return;
    }

    // Disable rule box for 3s.
    disableInputs(); setTimeout(enableInputs, 3000);
    
    ca_start(ruleNum);
}

function ca_start(ruleNum) {
    var ca = new CA();
    if (ca == null) {
        alert("Something is wrong. Couldn't instantiate a CA");
        return;
    }
    ca.init(ruleNum);

    var controller = new CA_Controller(ca, View);
    if (controller == null) {
        alert("Something is wrong. I couldn't instantiate a CA Controller");
        return;
    }

    controller.startAutomaton();
}    

function onClickLuckyButton() {
    var ruleNum =  Math.floor(Math.random()*256);
    document.getElementById('_ca_ruleNum').value = ruleNum;

    // Disable lucky for 3s, lest someone get too lucky :-)
    disableInputs(); setTimeout(enableInputs, 3000);

    ca_start(ruleNum);
}

function enableInputs() {
    document.getElementById('_ca_luckyButton').disabled = false;
    document.getElementById('_ca_ruleNum').disabled = false;
}

function disableInputs() {
    document.getElementById('_ca_luckyButton').disabled = true;
    document.getElementById('_ca_ruleNum').disabled = true;
}
