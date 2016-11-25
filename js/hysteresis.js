function Hysteresis(risingDelay, fallingDelay) {
  this.risingDelay = 0; // setDelay called at bottom
  this.fallingDelay = 0;
  this.lastTime = 0;
  this.lastValue = false;
  this.curValue = false;

  this.onBegin = function() { }
  this.onEnd = function() { }

  this.setDelay = function(risingDelay, fallingDelay) {
    if (typeof risingDelay === 'undefined') {
      risingDelay = 0;
    }
    if (typeof fallingDelay === 'undefined') {
      fallingDelay = risingDelay;
    }
    this.risingDelay = 1000 * risingDelay;
    this.fallingDelay = 1000 * fallingDelay;
  };

  this.update = function(value) {
    var curTime = performance.now();
    if (value != this.curValue) {
      if (value != this.lastValue) {
        this.lastTime = curTime;
      }
      var delay = value ? this.risingDelay : this.fallingDelay;
      if (curTime > delay + this.lastTime) {
        if(this.curValue != value) {
          if (value) {
            this.onBegin();
          } else {
            this.onEnd();
          }
        }
        this.curValue = value;
      }
    }
    this.lastValue = value;
    return this.curValue;
  };

  this.set = function(value) {
    this.curValue = value;
    this.lastValue = value;
    this.lastTime = performance.now();
    return this.curValue;
  };

  this.setDelay(risingDelay, fallingDelay);
}