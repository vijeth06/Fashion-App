


const COLOR_LABEL_MAP = new Map([
  ['0,0,0', 0],
  ['128,0,0', 1],
  ['255,0,0', 2],
  ['0,128,0', 3],
  ['128,128,0', 4],
  ['255,128,0', 5],
  ['0,255,0', 6],
  ['128,255,0', 7],
  ['255,255,0', 8],
  ['0,0,128', 9],
  ['128,0,128', 10],
  ['255,0,128', 11],
  ['0,128,128', 12],
  ['128,128,128', 13],
  ['255,128,128', 14],
  ['0,255,128', 15],
  ['128,255,128', 16],
  ['255,255,128', 17],
  ['0,0,255', 18],
  ['128,0,255', 19],
  ['255,0,255', 20],
  ['0,128,255', 21],
  ['128,128,255', 22],
  ['255,128,255', 23],
  ['0,255,255', 24],
  ['128,255,255', 25],
  ['255,255,255', 26]
]);

const EXTRA_MAPPINGS = [
  [[34,34,34].toString(), 0],
  [[0,255,0].toString(), 12],
  [[255,255,0].toString(), 5],
  [[0,255,128].toString(), 15],
  [[85,85,255].toString(), 13]
];
for (const [k, v] of EXTRA_MAPPINGS) COLOR_LABEL_MAP.set(k, v);

[
  [[255,170,0].toString(), 5],
  [[170,85,0].toString(), 10],
  [[0,170,85].toString(), 12],
  [[0,85,170].toString(), 14],
  [[170,0,170].toString(), 13],
  [[85,170,255].toString(), 15],
  [[170,255,85].toString(), 16],
  [[204,0,102].toString(), 9]
].forEach(([k,v]) => COLOR_LABEL_MAP.set(k, v));

function colorDistanceSquared(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr*dr + dg*dg + db*db;
}


export function rgbToLabel(rgb, tolerance = 1000) {
  const key = rgb.toString();
  if (COLOR_LABEL_MAP.has(key)) return COLOR_LABEL_MAP.get(key);

  let best = { dist: Infinity, label: 0 };
  for (const [k, label] of COLOR_LABEL_MAP.entries()) {
    const parts = k.split(',').map(n => Number(n));
    const d = colorDistanceSquared(parts, rgb);
    if (d < best.dist) {
      best.dist = d; best.label = label;
    }
  }

  return best.dist <= tolerance ? best.label : 0;
}


export function colorSegmentationToLabelMatrix(src) {
  let width, height, data;

  if (src instanceof ImageData) {
    ({ width, height, data } = src);
  } else if (src instanceof HTMLCanvasElement) {
    width = src.width; height = src.height;
    data = src.getContext('2d').getImageData(0,0,width,height).data;
  } else if (src instanceof HTMLImageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = src.naturalWidth || src.width;
    canvas.height = src.naturalHeight || src.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(src,0,0);
    width = canvas.width; height = canvas.height;
    data = ctx.getImageData(0,0,width,height).data;
  } else if (src instanceof Uint8ClampedArray || src instanceof Uint8Array) {

    throw new Error('Raw array input not supported without width/height. Pass ImageData or HTML element.');
  } else {
    throw new Error('Unsupported source type for colorSegmentationToLabelMatrix');
  }

  const labelMatrix = new Array(height);
  for (let y = 0; y < height; y++) {
    const row = new Array(width);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i]; const g = data[i+1]; const b = data[i+2];
  const label = rgbToLabel([r,g,b]);
  row[x] = label;
    }
    labelMatrix[y] = row;
  }

  return labelMatrix;
}

const segmentationTools = { colorSegmentationToLabelMatrix, rgbToLabel, COLOR_LABEL_MAP };
export default segmentationTools;
