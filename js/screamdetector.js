/*
  Stillness from frame differences. Every camera has noise,
  but when the mean motion gets significantly larger than the
  median motion, then we have real motion.
*/

class EyeContactDetector extends Detector {
  constructor(movementThreshold = 1.2) {
    super(0.25);
    this.movementThreshold = movementThreshold;

    var bins = 256;
    this.histogram = new Int32Array(bins);
  }

  resetHistogram() {
    for(var i = 0; i < this.histogram.length; i++) {
      this.histogram[i] = 0;
    }
  }

  update(previousPixels, curPixels, w, h) {
    this.resetHistogram();

    var n = w * h;

    var j = 0;
    var total = 0;
    for(var i = 0; i < n; i++) {
      var rdiff = Math.abs(curPixels[j] - previousPixels[j]); j++;
      var gdiff = Math.abs(curPixels[j] - previousPixels[j]); j++;
      var bdiff = Math.abs(curPixels[j] - previousPixels[j]); j++;
      j++; // ignore alpha

      var diff = Math.max(rdiff, Math.max(gdiff, bdiff));
      this.histogram[diff]++;
      total += diff;
    }
    var mean = Math.floor(total / n);
    var half = n / 2;

    var total = 0;
    var median = 0;
    for(var i = 0; i < this.histogram.length; i++) {
      if(total < half) {
        median = i;
        total += this.histogram[i];
      }
    }

    this.mean = mean;
    this.median = median;
    if(mean < median * this.movementThreshold) {
      super.addDetection();
      this.active = true;
    } else {
      this.active = false;
    }
  }
}