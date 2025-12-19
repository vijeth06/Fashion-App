// Standalone Node test runner for segmentation color->label mapping
// This duplicates the mapping logic to validate behavior without Jest.
const COLOR_LABEL_MAP = new Map([
  [[0,0,0].toString(), 0],
  [[255,0,0].toString(), 2],
  [[0,0,255].toString(), 13],
  [[85,51,0].toString(), 10],
  [[255,85,0].toString(), 5],
  [[0,255,255].toString(), 15],
  [[51,170,221].toString(), 14],
  [[0,85,85].toString(), 9],
  [[0,0,85].toString(), 6],
  [[0,128,0].toString(), 12],
  [[177,255,85].toString(), 17],
  [[85,255,170].toString(), 16],
  [[0,119,221].toString(), 5],
  [[255,255,255].toString(), 0],
  [[128,128,128].toString(), 0],
  [[255,128,0].toString(), 5],
]);

// Extra
[
  [[34,34,34].toString(), 0],
  [[0,255,0].toString(), 12],
  [[255,255,0].toString(), 5],
  [[0,255,128].toString(), 15],
  [[85,85,255].toString(), 13]
].forEach(([k,v]) => COLOR_LABEL_MAP.set(k, v));

function colorDistanceSquared(a,b){
  const dr=a[0]-b[0], dg=a[1]-b[1], db=a[2]-b[2];
  return dr*dr+dg*dg+db*db;
}

function rgbToLabel(rgb, tolerance=1000){
  const key = rgb.toString();
  if (COLOR_LABEL_MAP.has(key)) return COLOR_LABEL_MAP.get(key);
  let best={dist: Infinity, label:0};
  for (const [k,label] of COLOR_LABEL_MAP.entries()){
    const parts = k.split(',').map(n=>Number(n));
    const d = colorDistanceSquared(parts, rgb);
    if (d < best.dist){ best.dist = d; best.label = label; }
  }
  return best.dist <= tolerance ? best.label : 0;
}

function colorSegmentationToLabelMatrixFromArray(width, height, data){
  const matrix = new Array(height);
  for (let y=0;y<height;y++){
    const row = new Array(width);
    for (let x=0;x<width;x++){
      const i=(y*width+x)*4;
      const r=data[i], g=data[i+1], b=data[i+2];
      row[x] = rgbToLabel([r,g,b]);
    }
    matrix[y]=row;
  }
  return matrix;
}

// Simple assertions
function assert(desc, cond){
  if (!cond) { console.error('FAIL:', desc); process.exitCode = 1; throw new Error('Assertion failed: '+desc); }
  console.log('OK:', desc);
}

try {
  assert('exact match red->2', rgbToLabel([255,0,0]) === 2);
  assert('near match to orange->5', rgbToLabel([250,80,5], 2000) === 5);
  assert('far color fallback->0', rgbToLabel([10,200,10], 10) === 0);

  // image data: two pixels: red and black
  const width = 2, height = 1;
  const data = new Uint8ClampedArray([255,0,0,255, 0,0,0,255]);
  const mat = colorSegmentationToLabelMatrixFromArray(width, height, data);
  assert('matrix dims', mat.length === 1 && mat[0].length === 2);
  assert('matrix[0][0] is 2', mat[0][0] === 2);
  assert('matrix[0][1] is 0', mat[0][1] === 0);

  console.log('\nAll mapping checks passed');
  process.exit(process.exitCode || 0);
} catch (err){
  console.error(err && err.stack || err);
  process.exit(process.exitCode || 2);
}
