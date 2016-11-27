/*
  The Camera is a wrapper for the object returned by p5's createCapture()
  It adds the ability to check the framerate, and provides a callback for
  uniquely new frames (it ignores duplicate frames). It also keeps track
  of the previous frame and provides access to that.
*/

class Camera {
  constructor(p, width, height, cbNewFrame) {
    this.width = width;
    this.height = height;
    this.cbNewFrame = cbNewFrame;

    this.currentPixels = undefined;
    this.previousPixels = undefined;
    this.rateTimer = new RateTimer();

    this.updateTimeout;

    var constraints = {
      video: {
        width: {exact: width }
        // , height: { exact: height }
        // , frameRate: { min: 5, max: 15 }
      },
      audio: true
    };
    this.capture = p.createCapture(constraints);
    this.capture.size(this.width, this.height);
    this.capture.hide();
    this.update();
  }
  getFrameRate() {
    return this.rateTimer.getFrameRate();
  }
  update() {
    this.updateTimeout = window.requestAnimationFrame(this.update.bind(this));
    this.capture.loadPixels();
    this.currentPixels = this.capture.pixels;
    if(this.currentPixels.length > 0) {
      if(typeof this.previousPixels !== 'undefined') {
        if(compareImages(this.previousPixels, this.currentPixels, 4, this.width)) {
          return;
        } else {
          this.rateTimer.tick();
          this.cbNewFrame(this);
        }
      }
      this.previousPixels = copyImage(this.currentPixels, this.previousPixels);
    }
  }
  stop() {
    window.cancelAnimationFrame(this.updateTimeout);
  }
}
