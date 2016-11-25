/*
  The Camera is a wrapper for the object returned by p5's createCapture()
  It adds the ability to check the framerate, and provides a callback for
  uniquely new frames (it ignores duplicate frames). It also keeps track
  of the previous frame and provides access to that.
*/

class Camera {
  constructor(width, height, cbNewFrame) {
    this.width = width;
    this.height = height;
    this.cbNewFrame = cbNewFrame;

    this.previousPixels = undefined;
    this.rateTimer = new RateTimer();

    var constraints = {
      video: {
        width: {exact: width }
        // , height: { exact: height }
        // , frameRate: { min: 5, max: 15 }
      },
      audio: false
    };
    this.capture = createCapture(constraints);
    this.capture.hide();
    this.update();
  }
  getFrameRate() {
    return this.rateTimer.getFrameRate();
  }
  update() {
    window.requestAnimationFrame(this.update.bind(this));
    this.capture.loadPixels();
    if(this.capture.pixels.length > 0) {
      if(typeof this.previousPixels !== 'undefined') {
        if(compareImages(this.previousPixels, this.capture.pixels, 4, w)) {
          return;
        } else {
          this.rateTimer.tick();
          this.cbNewFrame(this);
        }
      }
      this.previousPixels = copyImage(this.capture.pixels, this.previousPixels);
    }
  }
}
