function subtractArrays (a, b, out) {
  var n = a.length;
  if(typeof out === 'undefined')  {
    out = new Float32Array(n);
  }
  for(var i = 0; i < n; i++) {
    out[i] = a[i] - b[i];
  }
  return out;
}

function subtractList (a, b) {
  var dx = 0;
  var dy = 0;
  for(var i = 0; i < a.length; i++) {
    dx += b[i][0] - a[i][0];
    dy += b[i][1] - a[i][1];
  }
  return [dx, dy];
};

function slowDraw(p, pix, w, h, channels) {
  p.loadPixels();
  var i = 0;
  if(channels == 1) {
    for(var y = 0; y < h; y++) {
      for(var x = 0; x < w; x++) {
        p.set(x, y, p.color(pix[i], pix[i], pix[i]));
        i++;
      }
    }
  } else {
    for(var y = 0; y < h; y++) {
      for(var x = 0; x < w; x++) {
        p.set(x, y, p.color(pix[i*4+0], pix[i*4+1], pix[i*4+2]));
        i++;
      }
    }   
  }
  p.updatePixels();
}

function absSumArray(arr) {
  var total = 0;
  var n = arr.length;
  for(var i = 0; i < n; i++) {
    total += Math.abs(arr[i]);
  }
  return total;
}

function sumArray(arr) {
  var total = 0;
  var n = arr.length;
  for(var i = 0; i < n; i++) {
    total += arr[i];
  }
  return total;
}

// cheap, phase-shifted version
function lowpassLerp(arr, lerpAmount, out) {
  var n = arr.length;
  if(typeof lerpAmount === 'undefined') {
    lerpAmount = 0.9;
  }
  if(typeof out === 'undefined')  {
    out = new arr.constructor(n);
  }
  var cur = arr[0];
  for(var i = 0; i < n; i++) {
    cur *= lerpAmount;
    cur += arr[i] * (1 - lerpAmount);
    out[i] = cur;
  }
  return out;
}

// more complicated, non-phase-shifted windowed average version
function lowpassWindow(arr, win, out) {
  var n = arr.length;
  if(typeof win === 'undefined') {
    win = 5;
  }
  if(typeof out === 'undefined')  {
    out = new arr.constructor(n);
  }

  var n = arr.length;
  if(n < (win*2+1)) {
    console.error('array is smaller than (win*2+1)');
    return out;
  }

  var cur = arr[0];
  var total = 1;
  out[0] = arr[0];

  // beginning chunk
  var j = 1;
  for(var i = 1; i <= win; i++) {
    cur += arr[j++];
    cur += arr[j++];
    total += 2;
    out[i] = cur / total;
  }

  // middle chunk
  for(var i = win+1; i < n-win; i++) {
    cur += arr[i+win];
    cur -= arr[i-win-1];
    out[i] = cur / total;
  }

  // ending chunk
  j = n - (2*win+1);
  for(var i = n-win; i < n; i++) {
    cur -= arr[j++];
    cur -= arr[j++];
    total -= 2;
    out[i] = cur / total;   
  }

  return out;
}