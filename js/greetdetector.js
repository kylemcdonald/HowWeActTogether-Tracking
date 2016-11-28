/*
  This detector makes a small version of the pixels, averages it over time,
  and looks for changes from the average. When the rate of change in a single
  cell is high, it becomes valid. When enough (adjacent) cells are valid,
  the detection is triggered. To make this detector more liberal, decrease
  the minActivation. To make it more conservative, increase the minActivation
  or increase the validThreshold to require a larger area of cells to be triggered.
*/

class GreetDetector extends Detector {
  constructor(validThreshold = 4, minActivation = 10, minNeighbors = 2) {
    super(0.5);

    this.validThreshold = validThreshold;
    this.minActivation = minActivation;
    this.minNeighbors = minNeighbors;

    this.levels = 5;
    this.downsample = 1 << this.levels;

    this.gray = undefined;
    this.averageGray = undefined;
    this.cells = undefined;
    this.position = [0, 0];
  }

  update(previousPixels, curPixels, w, h) {
    // convert curPixels to gray and downsample in place
    this.gray = rgbaToGray(curPixels, this.gray, w, h);
    downsampleInplace(this.gray, w, h, this.levels);
    var downsample = 1 << this.levels;
    var smallw = w / downsample, smallh = h / downsample;
    var smalln = smallw * smallh;

    // allocate and set averageGray if it's not ready
    if(typeof this.averageGray === 'undefined') {
      this.averageGray = new Float32Array(smalln);
      for(var i = 0; i < smalln; i++) {
        this.averageGray[i] = this.gray[i];
      }
    }

    // allocate cells if it's not ready
    if(typeof this.cells === 'undefined') {
      this.cells = new Array(smalln);
      for(var i = 0; i < smalln; i++) {
        this.cells[i] = new GreetCell();
      }
    }

    // calculate the averageGray image from the gray image
    var lerpAmount = 0.95; // this should really vary with framerate
    for(var i = 0; i < smalln; i++) {
      this.cells[i].add(this.gray[i] - this.averageGray[i]);
      this.averageGray[i] = (lerpAmount * this.averageGray[i]) + ((1 - lerpAmount) * this.gray[i]);
    }

    // initial pass to set validity absed on activation
    // and reset neighbor count
    for(var i = 0; i < smalln; i++) {
      var curCell = this.cells[i];
      curCell.valid = curCell.activation() > this.minActivation;
      curCell.neighbors = 0;
    }

    // check for 8-connected neighbors
    var i = 0;
    for(var y = 0; y < smallh; y++) {
      var hasBottom = (y + 1 < smallh);
      for(var x = 0; x < smallw; x++) {
        var hasRight = (x + 1 < smallw);

        var curCell = this.cells[i];
        var curValid = curCell.valid;
        var rightCell, bottomCell;
        if(hasRight) {
          rightCell = this.cells[i+1];
          if(curValid && rightCell.valid) {
            rightCell.neighbors++;
            curCell.neighbors++;
          }
        }
        if(hasBottom) {
          bottomCell = this.cells[i+smallw];
          if(curValid && bottomCell.valid) {
            bottomCell.neighbors++;
            curCell.neighbors++;
          }
        }
        if(hasRight && hasBottom) {
          var bottomRightCell = this.cells[i+smallw+1];
          if(curValid && bottomRightCell.valid) {
            bottomRightCell.neighbors++;
            curCell.neighbors++;
          }
        }

        i++;
      }
    }

    // second pass to remove spurious activations and count total valid
    var total = 0;
    var i = 0;
    var average = [0, 0];
    var totalWeight = 0;
    for(var y = 0; y < smallh; y++) {
      for(var x = 0; x < smallw; x++) {
        var cur = this.cells[i];
        cur.valid = cur.valid && cur.neighbors > this.minNeighbors;
        if(cur.valid) {
          var weight = cur.neighbors * cur.activation();
          average[0] += x * weight;
          average[1] += y * weight;
          total++;
          totalWeight += weight;
        }
        i++;
      }
    }
    average[0] *= downsample / totalWeight;
    average[1] *= downsample / totalWeight;

    if(total > this.validThreshold) {
      this.position = average;
      super.addDetection();
    }
  }
}

class GreetCell {
  // probably can get rid of highpassLength completely
  constructor(highpassWindow = 9, highpassLength = 100, sumDuration = 30) {
    this.highpass = new CircularHighpass(highpassWindow, highpassLength);
    this.derivativeSum = new CircularDerivativeSum(sumDuration);
    this.valid = false;
    this.neighbors = 0;
  }
  activation() {
    return this.derivativeSum.average;
  }
  add(sample) {
    var curHighpass = this.highpass.push(sample);
    this.derivativeSum.push(curHighpass);
  }
};

class CircularQueue {
  constructor(length) {
    this.index = 0;
    this.data = new Float32Array(length);
    this.length = length;
    this.halfLength = Math.floor(length / 2);
  }
  push(x) {
    this.data[this.index] = x;
    this.index = (this.index + 1) % this.length;
  }
  reverse(i) {
    return this.data[this.index + this.length - i];
  }
  first() {
    return this.data[this.index];
  }
  middle() {
    var middleIndex = (this.index + this.halfLength) % this.length;
    return this.data[middleIndex];
  }
}

// has a phase delay of (win / 2 + 1)
class CircularLowpass extends CircularQueue {
  constructor(win, length) {
    super(length);
    this.recent = new CircularQueue(win);
    this.runningSum = 0;
  }
  push(x) {
    this.runningSum -= this.recent.first();
    this.recent.push(x);
    this.runningSum += x;
    var cur = this.runningSum / this.recent.length;
    super.push(cur);
    return cur;
  }
}

class CircularHighpass extends CircularQueue {
  constructor(win, length) {
    super(length);
    if(win % 2 == 0) {
      console.error('window should be odd, not ' + win);
    }
    this.lowpass = new CircularLowpass(win, length);
  }
  push(x) {
    var lowpass = this.lowpass.push(x);
    var phaseShifted = this.lowpass.recent.middle();
    var cur = phaseShifted - lowpass;
    super.push(cur);
    return cur;
  }
}

class CircularDerivativeSum extends CircularQueue {
  constructor(length) {
    super(length);
    this.previous = undefined;
    this.sum = 0;
    this.average = 0;
  }
  push(x) {
    if(typeof this.previous !== 'undefined') {
      this.sum -= super.first();
      var diff = Math.abs(x - this.previous);
      this.sum += diff;
      this.average = this.sum / this.length;
      super.push(diff);
    }
    this.previous = x;
  }
}