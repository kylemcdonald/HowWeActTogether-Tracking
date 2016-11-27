class Graph {
  constructor(historyLength, minValue, maxValue) {
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.history = new Float32Array(historyLength);
    this.lowpass = undefined;
    this.highpass = undefined;
  }

  addSample(sample) {
    // shift everything over
    // this is slower than just using an offseted view of the array
    // but it is faster than doing the lowpass on an offseted view of the array
    for(var i = 0; i < this.history.length; i++) {
      this.history[i] = this.history[i+1];
    }
    this.history[this.history.length - 1] = sample; 
  }

  draw(p, width, height, signal) {
    if(typeof signal == 'undefined') {
      signal = this.history;
    }
    p.push();
    p.noFill();
    p.strokeWeight(1);
    p.beginShape();
    var range = this.maxValue - this.minValue;
    for(var i = 0; i < signal.length; i++) {
      var x = (i * width) / signal.length;
      var normalized = (signal[i] - this.minValue) / range;
      var y = height - (normalized * height);
      p.vertex(x, y);
    }
    p.endShape();
    p.pop();
  }

  drawLowpass(p, width, height, win) {
    this.lowpass = lowpassWindow(this.history, win, this.lowpass);
    this.draw(p, width, height, this.lowpass);
  }

  drawHighpass(p, width, height, win) {
    this.highpass = subtractArrays(this.history, this.lowpass, this.highpass);
    this.draw(p, width, height, this.highpass);
  }
}