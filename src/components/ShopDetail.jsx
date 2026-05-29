import React, { useState } from 'react';
import { Star, Plus } from 'lucide-react';
import { calculateAverageRating } from '../utils';

const ShopDetail = ({ shop, onAddRating, onAddShop }) => {
  const [isAddingShop, setIsAddingShop] = useState(false);
  const [newShop, setNewShop] = useState({ name: '', lat: '', lng: '' });
  const [newRating, setNewRating] = useState({ username: '', stars: 5 });

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (!newRating.username || !newRating.stars) return;
    onAddRating(shop.id, {
      id: Date.now().toString(),
      username: newRating.username,
      stars: parseInt(newRating.stars)
    });
    setNewRating({ username: '', stars: 5 });
  };

  const handleShopSubmit = (e) => {
    e.preventDefault();
    if (!newShop.name || !newShop.lat || !newShop.lng) return;
    onAddShop({
      id: Date.now().toString(),
      name: newShop.name,
      location: { lat: parseFloat(newShop.lat), lng: parseFloat(newShop.lng) },
      ratings: []
    });
    setNewShop({ name: '', lat: '', lng: '' });
    setIsAddingShop(false);
  };

  return (
    <div className="detail-panel">
      {!isAddingShop && !shop && (
        <div className="empty-state">
          <p>Select a coffee shop or add a new one.</p>
          <button className="btn-primary" onClick={() => setIsAddingShop(true)}>
            <Plus size={18} /> Add Coffee Shop
          </button>
        </div>
      )}

      {isAddingShop && (
        <div className="form-container">
          <h3>Add New Coffee Shop</h3>
          <form onSubmit={handleShopSubmit}>
            <input
              type="text"
              placeholder="Shop Name"
              value={newShop.name}
              onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
              required
            />
            <div className="coord-inputs">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={newShop.lat}
                onChange={(e) => setNewShop({ ...newShop, lat: e.target.value })}
                required
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={newShop.lng}
                onChange={(e) => setNewShop({ ...newShop, lng: e.target.value })}
                required
              />
            </div>
            <div className="button-group">
              <button type="submit" className="btn-primary">Add Shop</button>
              <button type="button" className="btn-secondary" onClick={() => setIsAddingShop(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!isAddingShop && shop && (
        <div className="shop-details">
          <div className="detail-header">
            <h2>{shop.name}</h2>
            <div className="avg-badge">
              <Star size={20} fill="currentColor" /> {calculateAverageRating(shop.ratings)}
            </div>
            <button className="btn-add-mini" onClick={() => setIsAddingShop(true)} title="Add New Shop">
                <Plus size={16} />
            </button>
          </div>

          <div className="ratings-section">
            <h3>Reviews</h3>
            <ul className="rating-list">
              {shop.ratings.map(r => (
                <li key={r.id} className="rating-item">
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < r.stars ? "currentColor" : "none"} color="currentColor" />
                    ))}
                  </div>
                  <span className="rating-user">by {r.username}</span>
                </li>
              ))}
              {shop.ratings.length === 0 && <p className="no-ratings">No reviews yet.</p>}
            </ul>
          </div>

          <div className="add-rating-form">
            <h3>Add your review</h3>
            <form onSubmit={handleRatingSubmit}>
              <input
                type="text"
                placeholder="Your Username"
                value={newRating.username}
                onChange={(e) => setNewRating({ ...newRating, username: e.target.value })}
                required
              />
              <div className="star-select">
                <label>Rating: </label>
                <select
                  value={newRating.stars}
                  onChange={(e) => setNewRating({ ...newRating, stars: e.target.value })}
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary">Submit Review</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDetail;
