var utils = {

  config: {
    mouthOpennessThreshold: 0.1,
    irisSize: 0.121
  },

  createTracker: function(capture) {
    var tracker = new clm.tracker({
      searchWindow: 11,
      scoreThreshold: 0.30,
    });
    tracker.init(pModel);
    tracker.start(capture.elt);
    document.addEventListener('clmtrackrIteration', clmtrackrIteration);
    document.addEventListener('clmtrackrLost', clmtrackrLost);
    document.addEventListener('clmtrackrNotFound', clmtrackrNotFound);
    document.addEventListener('clmtrackrConverged', clmtrackrConverged);
    return tracker;
  },

  formatRecording: function (recording) {
    var precision = 4;
    return '[' + recording.map(function (frame) {
      return '[' + frame.map(function (param) {
        return param.toPrecision(precision);
      }).join(',') + ']';
    }).join(',') + ']';
  },

  resetTracker: function (tracker, capture) {
    tracker.stop();
    tracker.reset();
    tracker.start(capture.elt);
  },

  drawParameters: function (params) {
    push();
    strokeWeight(1);
    translate(width / 2, 10);
    params.forEach(function(p) {
      rect(0, 0, p, 10);
      translate(0, 12);
    })
    pop();
  },

  getVertex: function (vertices, i) {
    return Array.isArray(i) ? utils.average(vertices, i) : vertices[i];
  },

  drawCurve: function (vertices, indices) {
      beginShape();
      indices.forEach(function(i) {
        var cur = utils.getVertex(vertices, i);
        curveVertex(cur[0], cur[1]);
      });
      endShape();
  },

  drawPolyline: function (vertices, indices) {
      beginShape();
      indices.forEach(function(i) {
        var cur = utils.getVertex(vertices, i);
        vertex(cur[0], cur[1]);
      });
      endShape();
  },

  average: function (vertices, indices) {
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
  },

  vectorLength: function(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  },

  subtract: function (a, b) {
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    return [dx, dy];
  },

  distance: function (a, b) {
    return utils.vectorLength(utils.subtract(a, b));
  },

  subtractList: function (a, b) {
    var dx = 0;
    var dy = 0;
    for(var i = 0; i < a.length; i++) {
      dx += b[i][0] - a[i][0];
      dy += b[i][1] - a[i][1];
    }
    return [dx, dy];
  },

  distanceList: function (a, b) {
    return utils.vectorLength(utils.subtractList(a, b));   
  },

  estimateCenter: function (positions) {
    return utils.average([positions[23], positions[28], positions[37]]);
  },

  // vulnerable to turning the head left/right
  estimateScale: function (positions) {
    return utils.distance(positions[23], positions[28]);
  },

  buildDescription: function (positions) {
    var description = {};

    var faceCenter = utils.estimateCenter(positions);
    var faceScale = utils.estimateScale(positions);

    var mouthCenter = utils.average([positions[60], positions[57]]);
    var mouthLR = utils.distance(positions[44], positions[50]);
    var mouthUD = utils.distance(positions[60], positions[57]);
    var mouthOpenness = mouthUD / mouthLR;

    description.faceScale = faceScale;
    description.mouthOpen = mouthOpenness > utils.config.mouthOpennessThreshold;

    return description;
  },

  drawFace: function(positions, description) {
      push();
      noFill();
      stroke(255);
      strokeWeight(2);

      // draws a curve with the list of indices
      // a list within the list means "use the average these indices"
      utils.drawCurve(positions, [34,35,36,[42,36,37],37,[43,37,38],38,39,40]); // nose
      utils.drawCurve(positions, [2,3,4,5,6,7,8,9,10,11,12]); // jaw
      utils.drawCurve(positions, [23,23,63,24,64,25,65,26,66,23]); // left eye
      utils.drawCurve(positions, [28,28,67,29,68,30,69,31,70,28]); // right eye
      utils.drawCurve(positions, [19,19,20,21,22,22]); // left eyebrow
      utils.drawCurve(positions, [15,15,16,17,18,18]); // right eyebrow
      utils.drawCurve(positions, [44,[44,45],45,46,47,48,49,[49,50],50]); // upper upper lip
      utils.drawCurve(positions, [44,[44,61],61,60,59,[59,50],50]); // lower upper lip
      if(description.mouthOpen) {
        utils.drawCurve(positions, [44,[44,56],56,57,58,[58,50],50]); // upper lower lip
      }
      utils.drawCurve(positions, [44,55,54,53,52,51,50]); // lower lower lip

      // draw left and right iris
      var s = description.faceScale * utils.config.irisSize;
      ellipse(positions[27][0], positions[27][1], s, s); // left iris
      ellipse(positions[32][0], positions[32][1], s, s); // right iris
      pop();
  }
};