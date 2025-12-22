import React from 'react';
import { useOutfit } from '../context/OutfitContext';

export default function Favorites() {
  const { favorites, removeFavorite } = useOutfit();

  return (
    <div className="container">
      <div className="row space-between" style={{ marginBottom: 12 }}>
        <h2>Favorites</h2>
        <span className="tip">Saved items for quick access</span>
      </div>

      {favorites.length === 0 ? (
        <p className="tip">No favorites yet. Save items from the Catalog or Try On.</p>
      ) : (
        <div className="grid grid-responsive">
          {favorites.map((item) => (
            <div key={item.id} className="card card-hover">
              <div className="item-thumb" style={{ height: 160 }}>
                <img src={item.imageUrl} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <div className="item-meta">
                <div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-category">{item.category}</div>
                </div>
                <button onClick={() => removeFavorite(item.id)} className="btn btn-danger">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}