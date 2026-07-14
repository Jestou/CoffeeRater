import React from 'react';
import { Coffee, MapPin, Compass } from 'lucide-react';
import SearchBar from './SearchBar';

const Sidebar = ({ shops, onSelectShop, selectedShopId, onSort, sortOrder, onAddShop }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          <Coffee size={28} strokeWidth={2.5} /> Coffee Rater
        </h2>

        {/* Nominatim Search Bar Integration */}
        <SearchBar onAddShop={onAddShop} />

        <div className="sort-controls">
          <button
            onClick={() => onSort('compositeScore')}
            className={sortOrder.type === 'compositeScore' ? 'active' : ''}
          >
            Value Score
          </button>
          <button
            onClick={() => onSort('alpha')}
            className={sortOrder.type === 'alpha' ? 'active' : ''}
          >
            A-Z
          </button>
          <button
            onClick={() => onSort('distance')}
            className={sortOrder.type === 'distance' ? 'active' : ''}
          >
            Distance
          </button>
        </div>
      </div>

      <ul className="shop-list">
        {shops.map((shop) => (
          <li
            key={shop.id}
            className={`shop-item duo-card ${selectedShopId === shop.id ? 'selected' : ''}`}
            onClick={() => onSelectShop(shop)}
          >
            <div className="shop-info">
              <div className="shop-main-details">
                <span className="shop-name">{shop.name}</span>
                <span className="shop-distance">
                  <MapPin size={12} /> {shop.distance < 1000 ? `${shop.distance}m` : `${(shop.distance/1000).toFixed(1)}km`} ({shop.walkingTime}m walk)
                </span>
              </div>
              <div className="shop-scores-summary">
                <div className="shop-composite-badge">
                  {shop.compositeScore}<span>/10</span>
                </div>
                <div className="shop-mini-ratings">
                  <div className="shop-mini-rating shop-mini-rating-coffee">
                    <span>☕</span> {shop.avgCoffee > 0 ? shop.avgCoffee : '-'}
                  </div>
                  <div className="shop-mini-rating shop-mini-rating-price">
                    <span>$</span> {shop.avgPrice > 0 ? shop.avgPrice : '-'}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
        {shops.length === 0 && (
          <div className="empty-state" style={{ padding: '20px' }}>
            <Compass size={40} className="empty-state-icon" />
            <p>No coffee shops added yet. Use the search bar above to find your first spot!</p>
          </div>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
