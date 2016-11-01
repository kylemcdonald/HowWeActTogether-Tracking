var capture;
var tracker;
var canvas;

var w = 640, h = 480;
var drawCamera = true;

var prevPositions = [];
var frameNumber = 0;
var savedRecording = [];
var recording = false;

function loadRecording(filename) {
  loadJSON(filename, function(data) {
    savedRecording = data.recording;
  });
}

function keyPressed(key) {
  if(key.key == 'z') {
    utils.resetTracker(tracker, capture);
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
    writeFile([utils.formatRecording(savedRecording)], 'recording.json');
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

function setup() {
  capture = createCapture(VIDEO);
  canvas = createCanvas(w, h);
  capture.size(w, h);
  capture.hide();
  tracker = utils.createTracker(capture);
  colorMode(HSB);
}

function clmtrackrIteration() {
  // console.log('clmtrackrIteration');
}
function clmtrackrLost() {
  console.log('clmtrackrLost');
}
function clmtrackrNotFound() {
  console.log('clmtrackrNotFound');
}
function clmtrackrConverged() {
  console.log('clmtrackrConverged');
}

function draw() {
  if(drawCamera) {
    image(capture, 0, 0, w, h);
  } else {
    background(0);
  }
  var positions = tracker.getCurrentPosition();

  if(positions.length > 0) {
    utils.drawFace(positions, utils.buildDescription(positions));
    // utils.drawParameters(tracker.getCurrentParameters());

    if(prevPositions.length > 0) {
      var dxy = utils.subtractList(positions, prevPositions);
    }
    prevPositions = positions.slice();

    if(recording) {
      savedRecording.push(tracker.getCurrentParameters().slice());   
    }
  }

  if(savedRecording.length > 0 && !recording) {
    var params = savedRecording[frameNumber % savedRecording.length];
    var positions = tracker.calculatePositions(params);
    utils.drawFace(positions, utils.buildDescription(positions));
  }

  frameNumber++;
}
