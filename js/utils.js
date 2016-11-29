// These utilities come in two parts.
// First, there are global functions that don't neew a p5 context or config.
// For others, say: var u = new utils(p); where p is a p5 context,
// and then the utils will use that context to draw.

function getTime() {
  return performance.now() / 1000;
}

function createTracker(capture) {
  var tracker = new clm.tracker({
    searchWindow: 11,
    scoreThreshold: 0.40,
  });
  tracker.init(pModel);
  if(capture) {
    tracker.start(capture.elt);
  }
  // document.addEventListener('clmtrackrIteration', clmtrackrIteration);
  // document.addEventListener('clmtrackrLost', clmtrackrLost);
  // document.addEventListener('clmtrackrNotFound', clmtrackrNotFound);
  // document.addEventListener('clmtrackrConverged', clmtrackrConverged);
  return tracker;
};

function formatRecording(recording) {
  var precision = 4;
  return '[' + recording.map(function (frame) {
    return '[' + frame.map(function (param) {
      return param.toPrecision(precision);
    }).join(',') + ']';
  }).join(',') + ']';
};

function resetTracker(tracker, capture) {
  tracker.stop();
  tracker.reset();
  tracker.start(capture.elt);
};

// copy an array, creating a new array if necessary
// usage: dst = copyImage(src, dst)
// based on http://jsperf.com/new-array-vs-splice-vs-slice/113
function copyImage(src, dst) {
  var n = src.length;
  if(!dst || dst.length != n) {
    dst = new src.constructor(n);
  }
  while(n--) {
    dst[n] = src[n];
  }
  return dst;
}

function compareImages(a1, a2, stride, n) {
  var start = (a1.length / 2) - n;
  for(var i = start; i < start + n; i+=stride) {
    if(a1[i] != a2[i]) {
      return false;
    }
  }
  return true;
}

function average(vertices, indices) {
  var center = [0., 0.];
  var n;
  if(Array.isArray(indices)) {
    indices.forEach(function (i) {
      center[0] += vertices[i][0];
      center[1] += vertices[i][1];
    })
    n = indices.length;
  } else {
    vertices.forEach(function(vertex) {
      center[0] += vertex[0];
      center[1] += vertex[1];
    })
    n = vertices.length;
  }
  center[0] /= n;
  center[1] /= n;
  return center;
};

function getVertex(vertices, i) {
  return Array.isArray(i) ? average(vertices, i) : vertices[i];
};

function vectorLength(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
};

function subtract (a, b) {
  var dx = b[0] - a[0];
  var dy = b[1] - a[1];
  return [dx, dy];
};

function distance (a, b) {
  return vectorLength(subtract(a, b));
};

function subtractList (a, b) {
  var dx = 0;
  var dy = 0;
  for(var i = 0; i < a.length; i++) {
    dx += b[i][0] - a[i][0];
    dy += b[i][1] - a[i][1];
  }
  return [dx, dy];
};

function distanceList (a, b) {
  return vectorLength(subtractList(a, b));   
};

function estimateCenter (positions) {
  return average([positions[23], positions[28], positions[37]]);
};

// vulnerable to turning the head left/right
function estimateScale (positions) {
  return distance(positions[23], positions[28]);
};


function rgbaToGray(rgba, gray, w, h) {
  var n = w * h;
  if(!gray) {
    gray = new Uint8ClampedArray(n);
  }
  var rgbaIndex = 1; // use green channel
  for(var grayIndex = 0; grayIndex < n; grayIndex += 1) {
    gray[grayIndex] = rgba[rgbaIndex];
    rgbaIndex += 4;
  }
  return gray;
}

// downsample pix by half `levels` times
// the final output will have size (w>>levels, h>>levels)
// not tested on odd-(or eventually odd-) sized images
function downsampleInplace(pix, w, h, levels) {
  for(var k = 0; k < levels; k++) {
    var halfw = w / 2;
    var halfh = h / 2;
    var i, j;

    // downsample on x axis
    i = 0;
    j = 0;
    for(var y = 0; y < h; y++) {
      var j = y * w;
      for(var x = 0; x < halfw; x++) {
        pix[i] = (pix[j]>>1) + (pix[j+1]>>1);
        i += 1;
        j += 2;
      }
    }

    // downsample on y axis
    i = 0;
    j = 0;
    for(var y = 0; y < halfh; y++) {
      var j = y * w;
      for(var x = 0; x < halfw; x++) {
        pix[i] = (pix[j]>>1) + (pix[j+halfw]>>1);
        i += 1;
        j += 1;
      }
    }

    w /= 2;
    h /= 2;
  }
}

var Utils = function(p) {

  var module = {};
  var description = {
  };

  var hysMouth = new Hysteresis(0.25);
  var handImage = p.loadImage('hand4x.png');

  function Config() {
    this.mouthOpennessThreshold = 0.1;
    this.irisSize = 0.121;
    this.smileThreshold = 0.58;
    this.screamingThreshold = 0.4;
    this.shakeMaxThreshold = 2.0;
  }

  config = new Config();
  // var gui = new dat.GUI();
  // gui.add(config, 'mouthOpennessThreshold', 0, 1);
  // gui.add(config, 'irisSize', 0, 1);
  // gui.add(config, 'smileThreshold', 0, 1);
  // gui.add(config, 'screamingThreshold', 0, 1);
  // gui.add(config, 'shakeMaxThreshold', 0, 5.0);

  module.drawHand = function (x, y) {
    var now = performance.now();
    var handSize = 0.25 * p.map(Math.sin(now / 400.), -1, +1, 0.95, 1.05);
    var waveAmount =  p.map(Math.sin(now / 500.), -1, +1, 0.7, 1.0);
    var waveRotation = Math.sin(now / 50.);
    var waveOffset = p.map(waveRotation, -1, +1, -20, +20);
    var left = x < p.width / 2;
    var xScale = (left ? -handSize : +handSize);
    var yScale = handSize;
    p.push();
    p.translate(x + waveOffset, y);
    p.scale(xScale, yScale);
    p.rotate(waveAmount * waveRotation);
    p.translate(-350, -480);
    p.image(handImage, 0, 0);
    p.pop();
  }

  module.drawParameters = function (params) {
    p.push();
    //p.strokeWeight(1);
    p.translate(p.width / 2, 10);
    params.forEach(function(p) {
      p.rect(0, 0, p, 10);
      p.translate(0, 12);
    })
    p.pop();
  };

  module.drawCurve = function (vertices, indices) {
    p.beginShape();
    indices.forEach(function(i) {
      var cur = getVertex(vertices, i);
      p.curveVertex(cur[0], cur[1]);
    });
    p.endShape();
  };

  module.drawPolyline = function (vertices, indices) {
    p.beginShape();
    indices.forEach(function(i) {
      var cur = getVertex(vertices, i);
      p.vertex(cur[0], cur[1]);
    });
    p.endShape();
  };

  module.drawClippingPath = function (ctx, positions, indices) {
    ctx.beginPath();
    ctx.moveTo(positions[indices[0]][0], positions[indices[0]][1]);
    for(var i = 1; i < indices.length; i++) {
      var index = indices[i];
      ctx.lineTo(positions[index][0], positions[index][1]);
    }
    ctx.closePath();
    ctx.clip();
  };

  module.buildDescription = function (positions) {
    // console.log(params[0], params[1])

    var faceCenter = estimateCenter(positions);
    var faceScale = estimateScale(positions);

    var mouthCenter = average([positions[60], positions[57]]);
    var mouthLR = distance(positions[44], positions[50]);
    var mouthUD = distance(positions[60], positions[57]);
    var mouthOpenness = mouthUD / mouthLR;
    var smileness = distance(positions[44], positions[50]) / faceScale;


    description.faceCenter = faceCenter;
    description.faceScale = faceScale;
    description.mouthOpenness = mouthOpenness;

    description.smiling = (smileness > config.smileThreshold);
    description.screaming = (mouthOpenness > config.screamingThreshold);
    description.mouthOpen = hysMouth.update(mouthOpenness > config.mouthOpennessThreshold);

    return description;
  };

  module.drawFace = function(positions, description, status, action) {

    if (status && action === 'scream') {
      var r = 1.03+.04*Math.random();
      p.push();
      p.scale(r);
    }

    p.noFill();

    if (status) {
      p.stroke(255, 0, 0);
    } else {
      p.stroke(255, 180, 180);
    }

    // draws a curve with the list of indices
    // a list within the list means "use the average these indices"
    module.drawCurve(positions, [34,35,36,[42,36,37],37,[43,37,38],38,39,40]); // nose
    module.drawCurve(positions, [2,3,4,5,6,7,8,9,10,11,12]); // jaw
    module.drawCurve(positions, [19,19,20,21,22,22]); // left eyebrow
    module.drawCurve(positions, [15,15,16,17,18,18]); // right eyebrow
    module.drawCurve(positions, [44,[44,45],45,46,47,48,49,[49,50],50]); // upper upper lip
    module.drawCurve(positions, [44,[44,61],61,60,59,[59,50],50]); // lower upper lip
    if(description.mouthOpen) {
      module.drawCurve(positions, [44,[44,56],56,57,58,[58,50],50]); // upper lower lip
    }
    module.drawCurve(positions, [44,55,54,53,52,51,50]); // lower lower lip

    // draw left and right iris
    var s = description.faceScale * config.irisSize;
    if (status && action === 'eyecontact') {
      p.stroke(255, 0, 200);
      s *= 0.3*Math.sin(p.frameCount*0.07)+0.9;
    }

    var ctx = p.canvas.getContext("2d");

    ctx.save();
    if (status && action === 'eyecontact') {
      p.noFill();
      p.stroke(255, 0, 0);
    }
    module.drawCurve(positions, [23,23,63,24,64,25,65,26,66,23]); // left eye
    module.drawClippingPath(ctx, positions, [23,63,24,64,25,65,26,66]); // left eye clipping
    if (status && action === 'eyecontact') {
      p.stroke(167, 79, 255);
      p.fill(167, 79, 255, 100);
    }
    p.ellipse(positions[27][0], positions[27][1], s, s); // left iris
    ctx.restore();

    ctx.save();
    if (status && action === 'eyecontact') {
      p.stroke(255, 0, 0);
      p.noFill();
    }
    module.drawCurve(positions, [28,28,67,29,68,30,69,31,70,28]); // right eye
    module.drawClippingPath(ctx, positions, [28,67,29,68,30,69,31,70]); // right eye clipping
    if (status && action === 'eyecontact') {
      p.stroke(167, 79, 255);
      p.fill(167, 79, 255, 100);
    }
    p.ellipse(positions[32][0], positions[32][1], s, s); // right iris
    ctx.restore();


    if (status && action === 'scream') {
      p.pop();
    }
  };

  module.drawNoFace = function() {
    p.noFill();
    p.stroke(255, 0, 0);
    p.strokeWeight(4);
    p.line(0.3*p.width, 0.3*p.height, 0.7*p.width, 0.7*p.height);
    p.line(0.3*p.width, 0.7*p.height, 0.7*p.width, 0.3*p.height);    
  };

  module.drawGreet = function(handPos) {
    if (handPos) {
      p.noStroke();
      p.fill(255, 0, 0, 100);
      var rot = p.random(-p.PI, p.PI);
      p.translate(handPos[0], handPos[1]);
      p.rotate(rot);
      p.ellipse(0, 0, 100+p.random(-25,25), 100); 
      p.rotate(-rot);
      p.translate(-handPos[0], -handPos[1]);
    }
  }

  return module;
};