/*
  Just use the description from clmtrackr and the level from the mic.
*/

class ScreamDetector extends Detector {
  constructor(mouthOpenThreshold = 0.1, levelThreshold = 0.25) {
    super(.5);
    this.mouthOpenThreshold = mouthOpenThreshold;
    this.levelThreshold = levelThreshold;
    this.mic = new p5.AudioIn();
    this.mic.start();
  }

  update(description) {
    if(description.mouthOpenness > this.mouthOpenThreshold && 
      this.mic.getLevel() > this.levelThreshold) {
      super.addDetection();
    }
  }

  stop() {
    mic.stop();
    delete this.mic;
  }
}