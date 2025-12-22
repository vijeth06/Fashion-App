import React from 'react';
import { useOutfit } from '../context/OutfitContext';

export default function Looks() {
  const { looks, removeLook } = useOutfit();

  return (
    <div className="container">
      <div className="row space-between" style={{ marginBottom: 12 }}>
        <h2>Saved Looks</h2>
        <span className="tip">Composite images saved locally</span>
      </div>
      {looks.length === 0 ? (
        <p className="tip">No saved looks yet. Use "Save Look" in Try On.</p>
      ) : (
        <div className="grid grid-responsive">
          {looks.map((l) => (
            <div key={l.id} className="card card-hover">
              <div className="item-thumb" style={{ height: 220 }}>
                <img src={l.dataUrl} alt="look" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} loading="lazy" decoding="async" />
              </div>
              <div className="row space-between" style={{ marginTop: 8 }}>
                <a className="btn btn-secondary" href={l.dataUrl} download={`look-${l.id}.png`}>Download</a>
                <button className="btn btn-danger" onClick={() => removeLook(l.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}