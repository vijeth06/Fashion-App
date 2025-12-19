import { colorSegmentationToLabelMatrix, rgbToLabel } from '../segmentationColorMap';

describe('segmentationColorMap', () => {
  test('rgbToLabel exact match and nearest fallback', () => {
    expect(rgbToLabel([255,0,0])).toBe(2); // exact
    // a color near [255,85,0] should map to label 5
    expect(rgbToLabel([250,80,5], 2000)).toBe(5);
    // unknown far color should fallback to 0
    expect(rgbToLabel([10,200,10], 10)).toBe(0);
  });

  test('colorSegmentationToLabelMatrix converts ImageData to label matrix', () => {
    // Create a 2x1 image (2 pixels horizontally) with pixel colors [255,0,0] and [0,0,0]
    const width = 2, height = 1;
    const data = new Uint8ClampedArray([255,0,0,255, 0,0,0,255]);
    const imageData = { width, height, data };
    const matrix = colorSegmentationToLabelMatrix(imageData);
    expect(matrix.length).toBe(1);
    expect(matrix[0][0]).toBe(2);
    expect(matrix[0][1]).toBe(0);
  });
});
