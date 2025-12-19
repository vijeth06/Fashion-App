// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Prevent tests from loading native canvas bindings (node-canvas) which may
// be incompatible with the CI/host Node version. Provide a light mock if any
// code requires 'canvas'.
jest.mock('canvas', () => ({
	Canvas: function() {},
	Image: function() {},
	createCanvas: () => ({ getContext: () => ({ getImageData: () => ({ data: new Uint8ClampedArray() }) }) })
}), { virtual: true });
