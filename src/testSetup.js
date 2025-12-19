// Force-load lightweight canvas mock before any tests run
jest.mock('canvas', () => require('./__mocks__/canvasMock'), { virtual: true });

// Also make global ImageData available if test environment needs it
if (typeof global.ImageData === 'undefined') {
  global.ImageData = class ImageData { constructor(data,w,h){ this.data = data; this.width = w; this.height = h; } };
}
