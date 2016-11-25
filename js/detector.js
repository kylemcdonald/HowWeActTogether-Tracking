/*
  A detector can continuously tell you whether something has recently been detected.
  The detector itself calls addDetection() when it has detected something.
  And users can call getStatus() to check whether something has been detected recently.
*/

class Detector {
  constructor(detectionDuration = 1) {
    this.detectionDuration = detectionDuration;
    this.lastDetectedTime = undefined;
  }

  addDetection() {
    this.lastDetectedTime = getTime();
  }

  getStatus() {
    if(typeof this.lastDetectedTime === 'undefined') {
      return false;
    }
    return (getTime() - this.lastDetectedTime) < this.detectionDuration;
  }
}