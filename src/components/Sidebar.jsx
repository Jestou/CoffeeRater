import React from 'react';
import { Star, ArrowUpDown } from 'lucide-react';

const Sidebar = ({ shops, onSelectShop, selectedShopId, onSort, sortOrder }) => {
  const getAverageRating = (ratings) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
    return (sum / ratings.length).toFixed(1);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Coffee Shops</h2>
        <div className="sort-controls">
          <button onClick={() => onSort('alpha')} className={sortOrder.type === 'alpha' ? 'active' : ''}>
            A-Z
          </button>
          <button onClick={() => onSort('rating')} className={sortOrder.type === 'rating' ? 'active' : ''}>
            Rating
          </button>
        </div>
      </div>
      <ul className="shop-list">
        {shops.map((shop) => (
          <li
            key={shop.id}
            className={`shop-item ${selectedShopId === shop.id ? 'selected' : ''}`}
            onClick={() => onSelectShop(shop)}
          >
            <div className="shop-info">
              <span className="shop-name">{shop.name}</span>
              <span className="shop-rating">
                <Star size={14} fill="currentColor" /> {getAverageRating(shop.ratings)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
