import React, { useState } from 'react';
import { Coffee, DollarSign, RefreshCw, Compass, MapPin, Clock } from 'lucide-react';

const ShopDetail = ({ shop, onAddRating }) => {
  const [coffeeRating, setCoffeeRating] = useState(5);
  const [priceRating, setPriceRating] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!shop) {
    return (
      <div className="detail-panel">
        <div className="empty-state">
          <Compass size={56} className="empty-state-icon" />
          <p>Select a coffee shop from the list or search above to rate and review!</p>
        </div>
      </div>
    );
  }

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/shops/${shop.id}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coffee_rating: coffeeRating,
          price_rating: priceRating,
        }),
      });

      if (response.ok) {
        const updatedShop = await response.json();
        onAddRating(updatedShop);
      }
    } catch (err) {
      console.error('Error adding rating:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render coffee symbols ☕
  const renderCoffeeSymbols = (rating) => {
    if (rating === 0) return <span className="stats-value" style={{opacity: 0.6}}>No ratings yet</span>;
    return (
      <div className="stats-value">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < Math.round(rating) ? 'symbol-filled' : 'symbol-empty'}
            style={{ marginRight: '2px' }}
          >
            ☕
          </span>
        ))}
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 'bold' }}>
          ({rating})
        </span>
      </div>
    );
  };

  // Helper to render price symbols $
  const renderPriceSymbols = (rating) => {
    if (rating === 0) return <span className="stats-value" style={{opacity: 0.6}}>No ratings yet</span>;
    return (
      <div className="stats-value" style={{ color: '#2E7D32' }}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < Math.round(rating) ? '' : 'symbol-empty'}
            style={{ marginRight: '2px', fontWeight: '900' }}
          >
            $
          </span>
        ))}
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 'bold' }}>
          ({rating})
        </span>
      </div>
    );
  };

  return (
    <div className="detail-panel">
      <div className="shop-details">
        {/* Header Section */}
        <div className="detail-header">
          <div className="detail-title-section">
            <h2>{shop.name}</h2>
            <div className="detail-location-meta">
              <span className="meta-item">
                <MapPin size={16} />
                {shop.distance < 1000 ? `${shop.distance}m` : `${(shop.distance / 1000).toFixed(1)}km`} from 123 Albert St
              </span>
              <span className="meta-item">
                <Clock size={16} />
                {shop.walkingTime} min walk
              </span>
            </div>
          </div>
          <div className="score-hero-container">
            <div className="score-hero-card duo-card">
              <div className="score-hero-val">{shop.compositeScore}</div>
              <div className="score-hero-label">Value Score</div>
            </div>
          </div>
        </div>

        {/* Details & Submission Grid */}
        <div className="detail-grid">
          {/* Left Panel: Statistics */}
          <div className="stats-card duo-card">
            <h3 className="stats-title">Performance Stats</h3>

            <div className="stats-row">
              <span className="stats-label">Coffee Quality</span>
              {renderCoffeeSymbols(shop.avgCoffee)}
            </div>

            <div className="stats-row">
              <span className="stats-label">Price Rating</span>
              {renderPriceSymbols(shop.avgPrice)}
            </div>

            <div className="stats-row">
              <span className="stats-label">Distance to Shop</span>
              <span className="stats-value" style={{ color: 'var(--text-main)' }}>
                {shop.distance} meters
              </span>
            </div>

            <div className="stats-row">
              <span className="stats-label">Walking Duration</span>
              <span className="stats-value" style={{ color: 'var(--text-main)' }}>
                ~ {shop.walkingTime} minutes
              </span>
            </div>

            <div className="stats-row">
              <span className="stats-label">Total Visits Rated</span>
              <span className="stats-value" style={{ color: 'var(--text-main)' }}>
                {shop.ratingsCount} visits
              </span>
            </div>
          </div>

          {/* Right Panel: Add Rating Visit */}
          <div className="rating-form-card duo-card">
            <h3>Log Coffee Visit</h3>
            <form onSubmit={handleRatingSubmit}>
              <div className="form-group">
                <label>Coffee Quality (☕)</label>
                <div className="symbol-selector-group">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`symbol-selector-btn symbol-selector-btn-coffee ${
                        coffeeRating === val ? 'active' : ''
                      }`}
                      onClick={() => setCoffeeRating(val)}
                    >
                      ☕
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Price Tier ($)</label>
                <div className="symbol-selector-group">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`symbol-selector-btn symbol-selector-btn-price ${
                        priceRating === val ? 'active' : ''
                      }`}
                      onClick={() => setPriceRating(val)}
                    >
                      $
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="duo-btn-primary"
                style={{ marginTop: '10px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="loader-mini" style={{ position: 'static' }} /> Saving Rating...
                  </>
                ) : (
                  'Submit Visit Rating'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;
