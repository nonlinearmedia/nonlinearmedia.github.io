/**
 * Creates a Cellular Automaton with the specified rule number (0-255). Per the convention
 * (See Module 3A.6, Wikipedia or Wolfram), the bits in the 8-bit binary representation of
 * ruleNum stand for the target (nextGen) value given the values of the 3 "parent" bits.
 * The bit number in the 8-bit rule (MSB = 7th, LSB = 0th) encodes the binary value of the
 * 3-bit parent for each next-gen bit.
 *
 * E.g. the 6th bit from the right (LSB) in ruleNum stands for the target value when the
 * parent bits have the values 1,0,1. The 3 parents of bit #N in the target (Mth generation)
 * are bits N-1, N and N+1 in the source (M-1th generation).
 *
 * &: 9/26/14
 */
function CA()
{
    this.inited = false;
    
    this.init = function(ruleNum) {
        // Set up the transformations
        this.transformations = new Array();
        for (var i = 0; i < 8; i++)
            this.transformations[i] = ((ruleNum & (1 << i)) != 0)? 1 : 0;

        // Init value of extremeBit (See Module 3A.6.2)
        this.extremeBit = 0;
        this.inited = true;
    }

    this.getSeedGeneration = function() {
        return [1];
    }

    /**
     * Given a bit vector, currentGen, this computes and returns the next generation according
     * to the ruleNumber with which this automaton was created (transformations).
     */
    this.propagate = function(currentGen) {
        if (currentGen.length == 0) return currentGen;

        var nextGen = new Array(currentGen.length+2);

        currentGen.unshift(this.extremeBit, this.extremeBit);
        currentGen.push(this.extremeBit, this.extremeBit);;
        
        for (var i = 1; i < currentGen.length-1; i++) {
            var transformIndex = 4*currentGen[i-1] + 2*currentGen[i] + currentGen[i+1];
            nextGen[i-1] = this.transformations[transformIndex];
        }

        // Set extremeBit for the next gen;
        this.extremeBit = this.transformations[this.extremeBit*7];
        return nextGen;
    }
}
