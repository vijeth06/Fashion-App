import React, { useRef, useState } from 'react';
import segmentationTools from '../services/segmentationColorMap';

export default function SegmentationUpload() {
  const canvasRef = useRef(null);
  const [counts, setCounts] = useState(null);

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const matrix = segmentationTools.colorSegmentationToLabelMatrix(canvas);
      // compute counts
      const freq = {};
      for (let y=0;y<matrix.length;y++){
        for (let x=0;x<matrix[0].length;x++){
          const v = matrix[y][x]; freq[v] = (freq[v]||0)+1;
        }
      }
      setCounts(freq);
    };
    img.src = URL.createObjectURL(file);
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Segmentation Upload Demo</h3>
      <input type="file" accept="image/*" onChange={handleFile} />
      <div className="mt-3">
        <canvas ref={canvasRef} style={{maxWidth: '100%'}} />
      </div>
      {counts && (
        <div className="mt-3">
          <h4 className="font-medium">Label counts</h4>
          <pre>{JSON.stringify(counts,null,2)}</pre>
        </div>
      )}
    </div>
  );
}
