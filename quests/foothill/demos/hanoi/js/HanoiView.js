/**
 * HanoiView maintains 3 arrays of discs. The constructor initializes array 1 with n divs
 * (corresponding to n discs). move(i, j, k) moves the top disc from i to j using k as a
 * holding area.
 * &: Sep 2015 (Foothill College, Los Altos Hills, CA 94022)
 */
function HanoiView(divID, width, height, nDiscs) {
    this.divID = divID;
    this.width = width;
    this.height = height;
    this.botMargin = 10;
    this.animationQueue = new Array();

    // Determine inter-pole spacing
    var interPoleSpacing = width / 3;

    this.poles = [
        { ctr: interPoleSpacing * 0.5, discs: new Array() },
        { ctr: interPoleSpacing * 1.5, discs: new Array() },
        { ctr: interPoleSpacing * 2.5, discs: new Array() }
    ];

    // Disc height
    this.discHeight = 0.75 * this.height/nDiscs;

    // Base disc diameter = 75% of the interPoleSpacing
    var baseDiscDia = interPoleSpacing * 0.75;

    $('#' + divID).html("");  // Clear

    // Add all discs to pole 1. Note: 0 is the bottom-most (widest) disc.
    for (var n = 0; n < nDiscs; n++) {
	      // This disc's diameter:
	      var discDia = baseDiscDia * Math.pow(0.9, n);
	      
	      // Determine the position of this disc in the viewport
	      var left = this.poles[0].ctr - discDia/2;
	      var top = this.height - this.botMargin - (n+1)*this.discHeight;
	      
	      // Create a new div with the appropriate dimensions and push on pole 1
	      var e = $(document.createElement('div'))
	          .addClass('_hanoi_disc')
	          .width(discDia)
	          .height(this.discHeight)
	          .css('left', left)
	          .css('top', top)
	      ;
	      this.poles[0].discs.push(e);
	      $('#' + divID).append(e);
    }

    /* Move the top disc from the src pole to the dst pole. Because the variable "this" is not bound when
     * called in global context from the animation queue, we bind it to the view parameter in a closure.
     */
    this.move = function(src, dst) {
        var mover = function(view) {
            var e = view.poles[src].discs.pop();
            var srcDiscDia = e.width();

            var numDstPoleDiscs = view.poles[dst].discs.length;
            var newTop = view.height - view.botMargin - (numDstPoleDiscs+1) * view.discHeight;
            var newLeft = view.poles[dst].ctr - srcDiscDia/2;

            // Visually move the div from the src to the dst
            e.animate({
                'left': newLeft,
                'top': newTop
            }, "slow");

            // Move the div element to the second pole.
            view.poles[dst].discs.push(e);
        };
        mover(this);
    }

    /* Enqueue a move to be depicted by the animator in turn. A move is a transfer
     * of a disc from the src pole to the dst pole.
     */
    this.enqueueMove = function(src, dst) {
	      this.animationQueue.push({"src":src, "dst":dst});
    }

    /* Animate the move of a disc from one pole to another. This is fired off
     * at the rate of one move per sec by enqueueing the next animation to happen
     * after 1000ms as long as there are pending animations.
     *
     * An oddity: This is fired off the global queue of timed actions - the
     * "this" object doesn't exist on the first call. We bind _HANOI_Controller.view
     * explicitly rather than "this" in the closure.
     * 
     */
    this.animate = function() {
        var animator = function(view) {
            if (view.animationQueue.length <= 0) {
                alert('All done!')
                _HANOI_Controller.enableInputs();
                return;
            }

            var nextMove = view.animationQueue.shift();
            view.move(nextMove.src, nextMove.dst);
            setTimeout(view.animate, 1000);
        };
        animator(_HANOI_Controller.view);
    }
}

