var interactiveSketch = function(p) {
  var u = new utils(p);

  var capture;
  var tracker;

  var w = 640, h = 480;
  var drawCamera = true;

  var prevPositions = [];
  var frameNumber = 0;
  var savedRecording = [];
  var recording = false;

  var zeros = [];

  function loadRecording(filename) {
    p.loadJSON(filename, function(data) {
      savedRecording = data;
    });
  }

  // function clmtrackrIteration() {
  //   // console.log('clmtrackrIteration');
  // }
  // function clmtrackrLost() {
  //   console.log('clmtrackrLost');
  // }
  // function clmtrackrNotFound() {
  //   console.log('clmtrackrNotFound');
  // }
  // function clmtrackrConverged() {
  //   console.log('clmtrackrConverged');
  // }

  p.keyPressed = function (key) {
    if(key.key == 'z') {
      u.resetTracker(tracker, capture);
    }
    if(key.key == 'x') {
      tracker.stop();
    }
    if(key.key == 'c') {
      drawCamera = !drawCamera;
    }
    // toggle recording
    if(key.key == 'r') {
      recording = !recording;
      if(recording) {
        savedRecording = [];
      }
    }
    // save recording
    if(key.key == 's') {
      p.writeFile([u.formatRecording(savedRecording)], 'recording.json');
    }
    if(key.key == '0') {
      savedRecording = [];
    }
  }

  p.setup = function () {
    p.createCanvas(w, h);
    capture = p.createCapture(p.VIDEO);
    capture.size(w, h);
    capture.hide();
    tracker = createTracker(capture);
    p.colorMode(p.HSB);
  }

  p.draw = function () {
    if(drawCamera) {
      p.image(capture, 0, 0, w, h);
    } else {
      p.background(0);
    }
    var positions = tracker.getCurrentPosition();
    var params = tracker.getCurrentParameters();

    if(positions.length > 0) {
      u.drawFace(positions, u.buildDescription(positions));
      // u.drawParameters(params);

      if(zeros.length) {
        var modifiedParameters = params.slice();
        zeros.forEach(function (i) {
          modifiedParameters[i] = 0;
        })
        var modifiedPositions = tracker.calculatePositions(modifiedParameters);
        u.drawFace(modifiedPositions, u.buildDescription(modifiedPositions));    
      }

      if(prevPositions.length > 0) {
        var dxy = u.subtractList(positions, prevPositions);
      }
      prevPositions = positions.slice();

      if(recording) {
        savedRecording.push(params.slice());   
      }
    }

    if(savedRecording.length > 0 && !recording) {
      var params = savedRecording[frameNumber % savedRecording.length];
      var positions = tracker.calculatePositions(params);
      u.drawFace(positions, u.buildDescription(positions));
    }

    frameNumber++;
  }
}

var interactivep5 = new p5(interactiveSketch, 'interactive');

var referenceTracker = createTracker();
var dataAnimation = function(filename) {
  return function(p) {
    var u = new utils(p);
    var w = 640, h = 480;
    var frameNumber = 0;
    var savedRecording = [];

    p.loadJSON(filename, function(data) {
      savedRecording = data;
    });

    p.setup = function () {
      p.createCanvas(w, h);
    }

    p.draw = function () {
      p.clear();
      if(savedRecording.length > 0) {
        var params = savedRecording[frameNumber % savedRecording.length];
        var positions = referenceTracker.calculatePositions(params);
        u.drawFace(positions, u.buildDescription(positions));
        frameNumber++;
      }
    }
  }
}

var datap5 = new p5(dataAnimation('data/nod-yes.json'), 'data-nod-yes');
var datap5 = new p5(dataAnimation('data/nod-no.json'), 'data-nod-no');
var datap5 = new p5(dataAnimation('data/surprised.json'), 'data-surprised');
var datap5 = new p5(dataAnimation('data/yawn.json'), 'data-yawn');