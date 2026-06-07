/**
 * The largest disc is 75% of one third of the div width. Smaller discs are
 * 10% smaller (0.9x) the width of their next biggest one.
 * &: Sep 2015 (Foothill College, Los Altos Hills, CA 94022)
 */
var _HANOI_Controller = null;

function onBodyLoad() {
    // Instantiate a global controller
    _HANOI_Controller = new HanoiController();

    // Fix the num discs number in the user message in index.html
    $('#_hanoi_maxDiscs').html(_HANOI_Controller.MAX_DISCS);
}

/**
 * The Controller solves the puzzle by generating the sequence of moves in the
 * solution. Only after all the moves have been generated does it invoke the viewer to
 * depict the moves visually on screen. By the time the first disc is visually moved,
 * the puzzle has already been solved (recursively). If you want to know the sequence
 * of moves, set a breakpoint on the setTimeout() (line 89) and examine the value of
 * this.view.animationQueue.  The solution is simple. To solve for N Discs, solve for
 * N-1 Discs from the source pole to the holding pole, transfer the last disc to the
 * target pole and then solve for N-1 Discs from the holding pole to the target pole
 * using the source pole as the holding pole.
 */
function HanoiController() {
    this.DIV_WIDTH = 900;
    this.DIV_HEIGHT = 300;
    this.MAX_DISCS = 20;

    /**
     * This is invoked when the user enters a number of discs themselves and hits ENTER
     */
    this.onRuleInputKeyUp = function(ev) {
        var NL = 10, CR = 13;

        var keyCode = ('which' in ev)? ev.which : ev.keyCode;
        if (keyCode != NL && keyCode != CR) return;

        var e = document.getElementById('_hanoi_nDiscs');
        var nDiscsStr = e.value.trim();

        if (nDiscsStr == "") return;
        var nDiscs = parseInt(nDiscsStr);

        if (isNaN(nDiscs) || nDiscs < 0 || nDiscs > this.MAX_DISCS) {
            alert('Number of discs must be a number (duh!) between 0 and ' + this.MAX_DISCS + ' (inclusive)');
            e.value = "10";
            return;
        }
        this.start(nDiscs);
    }

    // Select a number of discs randomly.
    this.onClickLuckyButton = function() {
        var nDiscs =  Math.floor(Math.random() * (this.MAX_DISCS-2)) + 2;
        document.getElementById('_hanoi_nDiscs').value = nDiscs;
        this.start(nDiscs);
    }

    // Inputs and buttons are disabled while a puzzle is being solved and re-enabled (from the view)
    // when done.
    this.enableInputs = function() {
        document.getElementById('_hanoi_luckyButton').disabled = false;
        document.getElementById('_hanoi_nDiscs').disabled = false;
    }

    this.disableInputs = function() {
        document.getElementById('_hanoi_luckyButton').disabled = true;
        document.getElementById('_hanoi_nDiscs').disabled = true;
    }

    /* Start solving the puzzle. Disable inputs before - they will be
     * re-enabled after the last move
     */
    this.start = function(nDiscs) {
        // The view could in theory be instantiated AFTER the puzzle has been solved.
        // But the solution involves heavy duty exponential recursion and so what's the point
        // of solving it if nobody can see the solution?
        this.view = new HanoiView('_hanoi_container', this.DIV_WIDTH, this.DIV_HEIGHT, nDiscs);
        if (this.view == null) {
            alert("A view has not been instantiated. I can't solve this.");
            return;
        }

        this.disableInputs();
        this.move(nDiscs, 0, 2, 1);

        // Note that our move() method simply enqueues a move for animation. Doesn't
        // visually move a disc on screen. To make that happen, we fire off the
        // animator method using a setTimeout(). The view.animate() method simply
        // dequeues pending moves as long as it's able to and depicts them in the
        // view.
        setTimeout(this.view.animate, 1500); // Start after a 1.5s delay
    }

    /**
     * This is the core of the puzzle's solution. It's a recursive implementation
     * where a solution for N discs relies upon a solution for N-1 discs. Rather
     * than complete each move in the animation before proceeding to the next, the method
     * simply enqueues the move for animation and relies on an independent viewer to do
     * whatever needs to be done to depict it.
     */
    this.move = function(nDiscs, src, dst, tmp) {
        if (nDiscs < 2) {
	          this.view.enqueueMove(src, dst);
	          return;
        }
        this.move(nDiscs-1, src, tmp, dst);
        this.move(1, src, dst, tmp);
        this.move(nDiscs-1, tmp, dst, src);
    }
}
