
class CanvasMock {
  constructor() { this.width = 0; this.height = 0; }
  getContext() { return { getImageData: () => ({ data: new Uint8ClampedArray() }), putImageData: () => {} }; }
}

class ImageMock {}

function createCanvas(w = 1, h = 1) { const c = new CanvasMock(); c.width = w; c.height = h; return c; }

module.exports = {
  Canvas: CanvasMock,
  Image: ImageMock,
  createCanvas,
  loadImage: async () => new ImageMock()
};
