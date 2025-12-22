
jest.mock('canvas', () => require('./__mocks__/canvasMock'), { virtual: true });

if (typeof global.ImageData === 'undefined') {
  global.ImageData = class ImageData { constructor(data,w,h){ this.data = data; this.width = w; this.height = h; } };
}
