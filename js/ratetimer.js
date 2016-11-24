class RateTimer {
  constructor() {
    this.smoothing = .9;
    this.lastTick = 0;
    this.averagePeriod = 0;
    this.secondTick = false;
  }
  reset() {
    this.lastTick = 0;
    this.averagePeriod = 0;
    this.secondTick = false;
  }
  getFrameRate() {
    return this.averagePeriod == 0 ? 0 : 1 / this.averagePeriod;
  }
  getPeriod() {
    return this.averagePeriod;
  }
  tick() {
    var curTick = window.performance.now() / 1000.;
    if(this.lastTick == 0) {
      this.secondTick = true;
    } else {
      var curDiff = curTick - this.lastTick;
      if(this.secondTick) {
        this.averagePeriod = curDiff;
        this.secondTick = false;
      } else {
        this.averagePeriod = curDiff * (1 - this.smoothing) + this.averagePeriod * this.smoothing;
      }
    }
    this.lastTick = curTick;
  }
};