function Hysteresis() {
  this.risingDelay = 0;
  this.fallingDelay = 0;
  this.lastTime = 0;
  this.lastValue = false;
  this.curValue = false;
  this.triggered = false;
  this.untriggered = false;

  this.resetTriggers = function() {
    this.triggered = false;
    this.untriggered = false;
  };

  this.setDelay = function(risingDelay, fallingDelay) {
    if (typeof fallingDelay === 'undefined') {
      fallingDelay = risingDelay;
    }
    this.risingDelay = 1000 * risingDelay;
    this.fallingDelay = 1000 * fallingDelay;
  };

  this.update = function(value) {
    this.resetTriggers();
    var curTime = performance.now();
    if (value != this.curValue) {
      if (value != this.lastValue) {
        this.lastTime = curTime;
      }
      var delay = value ? this.risingDelay : this.fallingDelay;
      if (curTime > delay + this.lastTime) {
        this.curValue = value;
      }
      if (value) {
        this.triggered = true;
      } else {
        this.untriggered = true;
      }
    }
    this.lastValue = value;
    return this.curValue;
  };

  this.set = function(value) {
    this.resetTriggers();
    if (value != this.curValue) {
      if (value) {
        this.triggered = true;
      } else {
        this.untriggered = false;
      }
    }
    this.curValue = value;
    this.lastValue = value;
    this.lastTime = performance.now();
    return this.curValue;
  };
}