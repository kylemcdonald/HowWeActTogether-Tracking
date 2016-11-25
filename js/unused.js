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

function slowDraw(pix, w, h, channels) {
  loadPixels();
  var i = 0;
  if(channels == 1) {
    for(var y = 0; y < h; y++) {
      for(var x = 0; x < w; x++) {
        set(x, y, color(pix[i], pix[i], pix[i]));
        i++;
      }
    }
  } else {
    for(var y = 0; y < h; y++) {
      for(var x = 0; x < w; x++) {
        set(x, y, color(pix[i*4+0], pix[i*4+1], pix[i*4+2]));
        i++;
      }
    }   
  }
  updatePixels();
}