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