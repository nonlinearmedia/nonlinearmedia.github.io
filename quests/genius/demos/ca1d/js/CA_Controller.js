/**
 * The CA_Controller talks to the automaton and updates the Viewport
 * &: 9/26/14
 */
function CA_Controller(ca, caView) {
    this.caView = caView;
    this.ca = ca;

    // Go forth and multiply (or not!)
    this.startAutomaton = function() {
        if (this.ca == null) return;
        this.caView.clear();

        // Set up closure variables
        var automaton = this.ca;
        var view = this.caView;
        var generationNumber = 0;
        var currGen = automaton.getSeedGeneration();

        var drawNextGen = function() {
            view.drawGeneration(currGen, generationNumber++);
            currGen = automaton.propagate(currGen);
            if (generationNumber < view.getHeight())
                setTimeout(drawNextGen, 1000/300); // 300 FPS
        }

        // Note: drawNextGen will not reschedule itself if at bottom of viewport
        drawNextGen();
    }
}

