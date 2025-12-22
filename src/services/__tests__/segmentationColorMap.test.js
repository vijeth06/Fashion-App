import { colorSegmentationToLabelMatrix, rgbToLabel } from '../segmentationColorMap';

describe('segmentationColorMap', () => {
  test('rgbToLabel exact match and nearest fallback', () => {
    expect(rgbToLabel([255,0,0])).toBe(2); // exact

    expect(rgbToLabel([250,80,5], 2000)).toBe(5);

    expect(rgbToLabel([10,200,10], 10)).toBe(0);
  });

  test('colorSegmentationToLabelMatrix converts ImageData to label matrix', () => {

    const width = 2, height = 1;
    const data = new Uint8ClampedArray([255,0,0,255, 0,0,0,255]);
    const imageData = { width, height, data };
    const matrix = colorSegmentationToLabelMatrix(imageData);
    expect(matrix.length).toBe(1);
    expect(matrix[0][0]).toBe(2);
    expect(matrix[0][1]).toBe(0);
  });
});
