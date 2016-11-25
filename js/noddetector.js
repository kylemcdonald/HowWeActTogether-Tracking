/*
  Averages overall vertical motion and looks for zero crossings.
  1. Not too fast (minDuration).
  2. Not too slow (maxDuration).
  3. Not too different from last nod (agreement).
  4. Not too subtle (minMotion).
*/

class NodDetector extends Detector {
  constructor(minDuration = 0.3, maxDuration = 1, agreement = 0.5, minMotion = 2) {
    super();

    this.minDuration = minDuration;
    this.maxDuration = maxDuration;
    this.agreement = agreement;
    this.minMotion = minMotion;

    this.lastChangeTime = undefined;
    this.previousMotion = undefined;
    this.lastDuration = undefined;
    this.totalMotion = 0;

    this.step = 8;
    this.flow = new FlowCalculator(this.step);
  }

  update(previousPixels, curPixels, w, h) {
    this.flow.calculateRgba(previousPixels, curPixels, w, h);
    var motion = this.flow.flow.v;
    this.totalMotion += Math.abs(motion);
    if(typeof this.previousMotion !== 'undefined') {
      var wasUp = this.previousMotion > 0;
      var nowDown = motion < 0;
      if(wasUp && nowDown) { // falling zero cross
        var curTime = getTime();
        if(typeof this.lastChangeTime !== 'undefined') {
          var curDuration = curTime - this.lastChangeTime;
          if(typeof this.lastDuration !== 'undefined' && /* there is a duration to compare */
            curDuration > this.minDuration && /* not too fast */
            curDuration < this.maxDuration) { /* not too slow */
            var durationDifference = Math.abs(curDuration - this.lastDuration);
            var durationAverage = (curDuration + this.lastDuration) / 2;
            if(durationDifference < durationAverage * this.agreement) {
              var averageMotion = this.totalMotion / curDuration;
              if(averageMotion > this.minMotion) {
                super.addDetection();
                // console.log('good nod ' + averageMotion);
              } else {
                // console.log('nod is too weak');
              }
            } else {
              // console.log('nod is too dissimilar in duration to last nod');
            }
          } else {
            // console.log('nod is too fast or too slow');
          }
          // reset
          this.lastDuration = curDuration;
          this.totalMotion = 0;
        }
        this.lastChangeTime = curTime;
      }
    }
    this.previousMotion = motion;
  }
}