

import '@testing-library/jest-dom';

jest.mock('canvas', () => ({
	Canvas: function() {},
	Image: function() {},
	createCanvas: () => ({ getContext: () => ({ getImageData: () => ({ data: new Uint8ClampedArray() }) }) })
}), { virtual: true });
