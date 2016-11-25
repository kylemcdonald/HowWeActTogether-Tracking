function Hysteresis(risingDelay, fallingDelay) {
  this.risingDelay = 0; // setDelay called at bottom
  this.fallingDelay = 0;
  this.curValue = false;

  this.lastTrueTime = 0;
  this.lastFalseTime = 0;

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
    
    if (value) {
      this.lastTrueTime = curTime;
    } else {
      this.lastFalseTime = curTime;
    }

    var timeSinceDiff = curTime - (value ? this.lastFalseTime : this.lastTrueTime);
    if (value) {
      if(timeSinceDiff > this.risingDelay && this.curValue == false) {
        this.curValue = true;
        this.onBegin();
      }
    } else {
      if(timeSinceDiff > this.fallingDelay && this.curValue == true) {
        this.curValue = false;
        this.onEnd();
      }
    }
    // console.log(this.curValueContinuous);

    return this.curValue;
  };

  this.setDelay(risingDelay, fallingDelay);
}