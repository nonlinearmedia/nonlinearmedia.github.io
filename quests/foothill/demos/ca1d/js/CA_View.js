/**
 * Creates and maintains a viewport within the divID given to it by the caller.
 * Has methods to clear the viewport and to draw a given generation of a CA
 * in it.
 * &: 9/26/14
 */
function CA_View(divID, width, height)
{
    var container = document.getElementById(divID);
    if (container == null) return null;
    
    this.canv = document.createElement('canvas');
    this.canv.width = width;
    this.canv.height = height;
    container.appendChild(this.canv);

    /**
     * Visually depict the given generation, someGen, as a row of white (0) and black (1) pixels.
     * The level param is the generation number and is used to vertically displace the row of
     * pixels from the top of the canvas.
     */
    this.drawGeneration = function(someGen, level) {
        var ctx = this.canv.getContext('2d');
        var left = (this.canv.width-someGen.length)/2;
        for (var i = 0; i < someGen.length; i++) {
            if (someGen[i] != 0)
              ctx.fillRect(left+i, level, 1, 1);
        }
    }

    this.clear = function() {
        var ctx = this.canv.getContext('2d');
        ctx.clearRect(0, 0, this.canv.width, this.canv.height);
    }

    this.getHeight = function() { return this.canv.height; }
    this.getWidth = function() { return this.canv.width; }
}
