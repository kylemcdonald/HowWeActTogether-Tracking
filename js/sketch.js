var interactiveSketch = function(p) {
  var u = new utils(p);
  
  var capture;
  var tracker;
  var canvas;

  var w = 640, h = 480;
  var drawCamera = true;

  var prevPositions = [];
  var frameNumber = 0;
  var savedRecording = [];
  var recording = false;

  var zeros = [];

  function loadRecording(filename) {
    loadJSON(filename, function(data) {
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
    if(key.key == '1') {
      loadRecording('data/nod-no.json');
    }
    if(key.key == '2') {
      loadRecording('data/nod-yes.json');
    }
    if(key.key == '3') {
      loadRecording('data/surprised.json');
    }
    if(key.key == '4') {
      loadRecording('data/yawn.json');
    }
  }

  p.setup = function () {
    canvas = p.createCanvas(w, h);
    capture = p.createCapture(p.VIDEO);
    capture.size(w, h);
    capture.hide();
    tracker = u.createTracker(capture);
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