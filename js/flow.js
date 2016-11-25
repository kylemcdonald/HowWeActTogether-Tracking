// copied from https://github.com/anvaka/oflow

class FlowZone{
  constructor (x, y, u, v) {
    this.x = x;
    this.y = y;
    this.u = u;
    this.v = v;
  }
}

class FlowCalculator {
  constructor(step = 8) {
    this.step = step;
  }

  calculateGray (oldImage, newImage, width, height) {
    return this.calculate (oldImage, newImage, width, height, 1);
  }

  calculateRgba (oldImage, newImage, width, height) {
    return this.calculate (oldImage, newImage, width, height, 4);
  }

  calculate (oldImage, newImage, width, height, channels) {
    var zones = [];
    var step = this.step;
    var winStep = step * 2 + 1;

    var A2, A1B2, B1, C1, C2;
    var u, v, uu, vv;
    uu = vv = 0;
    var wMax = width - step - 1;
    var hMax = height - step - 1;
    var globalY, globalX, localY, localX;

    for (globalY = step + 1; globalY < hMax; globalY += winStep) {
      for (globalX = step + 1; globalX < wMax; globalX += winStep) {
        A2 = A1B2 = B1 = C1 = C2 = 0;

        for (localY = -step; localY <= step; localY++) {
          for (localX = -step; localX <= step; localX++) {
            var address = (globalY + localY) * width + globalX + localX;

            var gradX = (newImage[(address - 1) * channels]) - (newImage[(address + 1) * channels]);
            var gradY = (newImage[(address - width) * channels]) - (newImage[(address + width) * channels]);
            var gradT = (oldImage[address * channels]) - (newImage[address * channels]);

            A2 += gradX * gradX;
            A1B2 += gradX * gradY;
            B1 += gradY * gradY;
            C2 += gradX * gradT;
            C1 += gradY * gradT;
          }
        }

        var delta = (A1B2 * A1B2 - A2 * B1);

        if (delta !== 0) {
          /* system is not singular - solving by Kramer method */
          var Idelta = step / delta;
          var deltaX = -(C1 * A1B2 - C2 * B1);
          var deltaY = -(A1B2 * C2 - A2 * C1);

          u = deltaX * Idelta;
          v = deltaY * Idelta;
        } else {
          /* singular system - find optical flow in gradient direction */
          var norm = (A1B2 + A2) * (A1B2 + A2) + (B1 + A1B2) * (B1 + A1B2);
          if (norm !== 0) {
            var IGradNorm = step / norm;
            var temp = -(C1 + C2) * IGradNorm;

            u = (A1B2 + A2) * temp;
            v = (B1 + A1B2) * temp;
          } else {
            u = v = 0;
          }
        }

        if (-winStep < u && u < winStep &&
          -winStep < v && v < winStep) {
          uu += u;
          vv += v;
          zones.push(new FlowZone(globalX, globalY, u, v));
        }
      }
    }

    this.flow = {
      zones : zones,
      u : uu / zones.length,
      v : vv / zones.length
    };

    return this.flow;
  }

};