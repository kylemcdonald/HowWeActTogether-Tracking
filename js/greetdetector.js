/*
  
*/

class GreetDetector extends Detector {
  constructor(waveThreshold = 1, minPeriod = .2, maxPeriod = .8, minStrength = 18, minNeighbors = 1) { // integer
    super();
    this.waveThreshold = 1;
    this.minPeriod = minPeriod;
    this.maxPeriod = maxPeriod;
    this.minStrength = minStrength;
    this.minNeighbors = minNeighbors;

    this.levels = 5;
    this.downsample = 1<<this.levels;
    this.gray = undefined;
    this.averageGray = undefined;
    this.timers = [];
  }

  update(previousPixels, curPixels, w, h) {
    var curTime = getTime();

    this.gray = rgbaToGray(curPixels, this.gray, w, h);
    downsampleInplace(this.gray, w, h, this.levels);
    var smallw = w / this.downsample, smallh = h / this.downsample;
    var smalln = smallw * smallh;
    if(typeof this.averageGray === 'undefined') {
      this.averageGray = new Float32Array(smalln);
      for(var i = 0; i < smalln; i++) {
        this.averageGray[i] = this.gray[i];
      }
    }
    if(this.timers.length == 0) {
      for(var i = 0; i < smalln; i++) {
        this.timers.push(new ZeroCrossDetector());
      }
    }
    var lerpAmount = 0.95; // this should really vary with framerate
    for(var i = 0; i < smalln; i++) {
      this.timers[i].addSample(this.gray[i] - this.averageGray[i]);
      this.averageGray[i] = (lerpAmount * this.averageGray[i]) + ((1 - lerpAmount) * this.gray[i]);
    }

    // threshold on period and strength
    var i = 0;
    for(var y = 0; y < smallh; y++) {
      for(var x = 0; x < smallw; x++) {
        var curTimer = this.timers[i];
        var curPeriod = this.timers[i].period;
        curTimer.valid = curPeriod > this.minPeriod && 
          curPeriod < this.maxPeriod && 
          curTimer.strength > this.minStrength;
        curTimer.neighbors = 0; // reset neighbors
        i++;
      }
    }

    // add up neighbors
    for(var y = 0; y < smallh-1; y++) {
      for(var x = 0; x < smallw-1; x++) {
        var i = y * smallw + x;
        if(this.timers[i].valid) {
          if(this.timers[i+1].valid) {
            this.timers[i].neighbors++;
            this.timers[i+1].neighbors++;
          }
          if(this.timers[i+smallw].valid) {
            this.timers[i].neighbors++;
            this.timers[i+smallw].neighbors++;
          }
        }
      }
    }

    // threshold on neighbors
    var minNeighbors = 2;
    var total = 0;
    for(var i = 0; i < smalln; i++) {
      this.timers[i].valid = this.timers[i].valid && this.timers[i].neighbors > this.minNeighbors;
      if(this.timers[i].valid) {
        total++;
      }
    }

    if(total > this.waveThreshold) {
      super.addDetection();
      return true;
    }
    return false;
  }
}

class ZeroCrossDetector {
  constructor() {
    this.previous = undefined;
    this.strength = 0;
    this.lastCross = undefined;
    this.period = undefined;
    this.valid = false;
    this.neighbors = 0;
  }
  addSample(sample) {
    var curTime = performance.now() / 1000;
    if(typeof this.previous !== 'undefined') {
      if(this.previous < 0 && sample > 0) {
        this.period = curTime - this.lastCross;
        this.lastCross = curTime;
      }
    }
    var absSample = Math.abs(sample);
    if(absSample > this.strength) {
      this.strength = absSample;
    } else {
      this.strength *= 0.9; // should really be framerate based 
    }
    this.previous = sample;
  }
};