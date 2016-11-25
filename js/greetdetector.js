/*
  Thresholds on the standard deviation of the binned motion.
  If motion is uniform in all directions and speeds (low standard deviation),
  then it counts as a greeting. The threshold is in seconds.
  If the threshold is increased then the detector is more liberal.
  If it's decreased then it's more conservative.
*/

class GreetDetector extends Detector {
  constructor(waveThreshold = 0.04) {
    super();

    this.frameCount = 0;
    this.waveThreshold = waveThreshold;
    this.step = 4;
    this.bins = 7;
    this.lastMotion = new Float32Array(this.bins * this.bins);
    this.flow = new FlowCalculator(this.step);
  }

  update(previousPixels, curPixels, w, h) {
    var curTime = getTime();

    this.flow.calculateRgba(previousPixels, curPixels, w, h);
    var maxSide = (this.step * 2 + 1);
    var multiplier = this.bins / (2 * maxSide);
    this.flow.flow.zones.forEach((zone) => {
      var x = Math.floor(multiplier * (maxSide + zone.u));
      var y = Math.floor(multiplier * (maxSide + zone.v));
      var i = y * this.bins + x;
      this.lastMotion[i] = curTime;
    })

    var averageDiff = 0;
    for(var i = 0; i < this.lastMotion.length; i++) {
      if(this.lastMotion[i] > 0) {
        var curDiff = curTime - this.lastMotion[i];
        averageDiff += curDiff;
      }
    }
    averageDiff /= this.lastMotion.length;

    var sumSqDiff = 0;
    for(var i = 0; i < this.lastMotion.length; i++) {
      var curDiff = curTime - this.lastMotion[i];
      curDiff *= curDiff;
      sumSqDiff += curDiff;
    }
    sumSqDiff /= this.lastMotion.length;
    sumSqDiff = Math.pow(sumSqDiff, .5);

    if(this.frameCount > 10 && sumSqDiff < this.waveThreshold) {
      // console.log(sumSqDiff);
      super.addDetection();
    }

    this.frameCount++;
  }
}