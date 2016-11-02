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

var utils = function(p) {

	var module = {};

	var config = {
		mouthOpennessThreshold: 0.1,
		irisSize: 0.121
	};

	module.formatRecording = function (recording) {
		var precision = 4;
		return '[' + recording.map(function (frame) {
			return '[' + frame.map(function (param) {
				return param.toPrecision(precision);
			}).join(',') + ']';
		}).join(',') + ']';
	};

	module.resetTracker = function (tracker, capture) {
		tracker.stop();
		tracker.reset();
		tracker.start(capture.elt);
	};

	module.drawParameters = function (params) {
		p.push();
		p.strokeWeight(1);
		p.translate(p.width / 2, 10);
		params.forEach(function(p) {
			p.rect(0, 0, p, 10);
			p.translate(0, 12);
		})
		p.pop();
	};

	module.getVertex = function (vertices, i) {
		return Array.isArray(i) ? module.average(vertices, i) : vertices[i];
	};

	module.drawCurve = function (vertices, indices) {
		p.beginShape();
		indices.forEach(function(i) {
			var cur = module.getVertex(vertices, i);
			p.curveVertex(cur[0], cur[1]);
		});
		p.endShape();
	};

	module.drawPolyline = function (vertices, indices) {
		p.beginShape();
		indices.forEach(function(i) {
			var cur = module.getVertex(vertices, i);
			p.vertex(cur[0], cur[1]);
		});
		p.endShape();
	};

	module.average = function (vertices, indices) {
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

	module.vectorLength = function(v) {
		return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
	};

	module.subtract = function (a, b) {
		var dx = b[0] - a[0];
		var dy = b[1] - a[1];
		return [dx, dy];
	};

	module.distance = function (a, b) {
		return module.vectorLength(module.subtract(a, b));
	};

	module.subtractList = function (a, b) {
		var dx = 0;
		var dy = 0;
		for(var i = 0; i < a.length; i++) {
			dx += b[i][0] - a[i][0];
			dy += b[i][1] - a[i][1];
		}
		return [dx, dy];
	};

	module.distanceList = function (a, b) {
		return module.vectorLength(module.subtractList(a, b));   
	};

	module.estimateCenter = function (positions) {
		return module.average([positions[23], positions[28], positions[37]]);
	};

	// vulnerable to turning the head left/right
	module.estimateScale = function (positions) {
		return module.distance(positions[23], positions[28]);
	};

	module.buildDescription = function (positions) {
		var description = {};

		var faceCenter = module.estimateCenter(positions);
		var faceScale = module.estimateScale(positions);

		var mouthCenter = module.average([positions[60], positions[57]]);
		var mouthLR = module.distance(positions[44], positions[50]);
		var mouthUD = module.distance(positions[60], positions[57]);
		var mouthOpenness = mouthUD / mouthLR;

		// var scale = params[0];
		// var zrotation = params[1];
		// var xposition = params[2];
		// var yposition = params[3];
		// var yrotation = params[4];
		// var xrotation = params[5];

		description.faceScale = faceScale;
		description.mouthOpen = mouthOpenness > config.mouthOpennessThreshold;

		return description;
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

	module.drawFace = function(positions, description) {
		p.push();
		p.noFill();
		p.stroke(255);
		p.strokeWeight(2);

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
		var ctx = p.canvas.getContext("2d");

		ctx.save();
		module.drawCurve(positions, [23,23,63,24,64,25,65,26,66,23]); // left eye
		module.drawClippingPath(ctx, positions, [23,63,24,64,25,65,26,66]); // left eye clipping
		p.ellipse(positions[27][0], positions[27][1], s, s); // left iris
		ctx.restore();

		ctx.save();
		module.drawCurve(positions, [28,28,67,29,68,30,69,31,70,28]); // right eye
		module.drawClippingPath(ctx, positions, [28,67,29,68,30,69,31,70]); // right eye clipping
		p.ellipse(positions[32][0], positions[32][1], s, s); // right iris
		ctx.restore();

		p.pop();
	};

	return module;
};