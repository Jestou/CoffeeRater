import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, MapPin, Coffee, HelpCircle } from 'lucide-react';

const SearchBar = ({ onAddShop }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualError, setManualError] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch from OpenStreetMap Nominatim Geocoding API
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Query OSM Nominatim. Filter results near Brisbane center (bounding box) to prioritize local results
        // Brisbane bounding box: viewbox=152.8,-27.65,153.25,-27.35&bounded=1
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ' Brisbane'
        )}&viewbox=152.8,-27.65,153.25,-27.35&bounded=1&limit=5`;

        const res = await fetch(url, {
          headers: {
            'User-Agent': 'CoffeeShopRaterLocalApp/1.0',
          },
        });
        const data = await res.json();

        // Map results to a simplified format
        const formattedResults = data.map((item) => ({
          name: item.display_name.split(',')[0],
          address: item.display_name.split(',').slice(1).join(',').trim(),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }));

        setResults(formattedResults);
        setShowDropdown(true);
      } catch (err) {
        console.error('Error fetching from Nominatim geocoding:', err);
      } finally {
        setIsLoading(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectResult = async (item) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          lat: item.lat,
          lng: item.lng,
        }),
      });
      if (response.ok) {
        const addedShop = await response.json();
        onAddShop(addedShop);
        setQuery('');
        setShowDropdown(false);
      }
    } catch (err) {
      console.error('Error adding shop from search:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    setIsLoading(true);
    setManualError('');

    try {
      // Attempt to geocode the manual address
      let lat = -27.47093; // fallback 123 Albert St
      let lng = 153.02648;

      if (manualAddress.trim()) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          manualAddress + ' Brisbane'
        )}&viewbox=152.8,-27.65,153.25,-27.35&bounded=1&limit=1`;

        const res = await fetch(url, {
          headers: {
            'User-Agent': 'CoffeeShopRaterLocalApp/1.0',
          },
        });
        const data = await res.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        }
      }

      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: manualName,
          lat,
          lng,
        }),
      });

      if (response.ok) {
        const addedShop = await response.json();
        onAddShop(addedShop);
        setManualName('');
        setManualAddress('');
        setShowManualForm(false);
        setQuery('');
      } else {
        setManualError('Failed to save the shop to the server.');
      }
    } catch (err) {
      console.error('Error adding manual shop:', err);
      setManualError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-container" ref={dropdownRef}>
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search to add coffee shops..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
        />
        {isLoading && <div className="loader-mini" />}
      </div>

      {showDropdown && (
        <div className="search-dropdown duo-card">
          {results.length > 0 && (
            <ul className="search-results-list">
              {results.map((item, idx) => (
                <li
                  key={idx}
                  className="search-result-item"
                  onClick={() => handleSelectResult(item)}
                >
                  <MapPin size={16} className="item-pin" />
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-address">{item.address || 'Brisbane'}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="no-find-prompt">
            <p>Can't find the shop?</p>
            <button
              className="duo-btn-secondary"
              onClick={() => {
                setShowManualForm(true);
                setShowDropdown(false);
                setManualName(query);
              }}
            >
              <Plus size={14} /> Add it manually
            </button>
          </div>
        </div>
      )}

      {showManualForm && (
        <div className="manual-form-overlay">
          <div className="manual-form-modal duo-card">
            <h3>Add New Coffee Shop</h3>
            <form onSubmit={handleManualSubmit} className="manual-form">
              <div className="form-group">
                <label>Shop Name</label>
                <input
                  type="text"
                  placeholder="e.g. Merlo Coffee Cafe"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address (Optional - Geocodes coordinates)</label>
                <input
                  type="text"
                  placeholder="e.g. 123 Albert St, Brisbane"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                />
                <span className="input-tip">
                  We'll search OpenStreetMap to find its location. Defaults to Brisbane CBD if blank.
                </span>
              </div>
              {manualError && <span className="error-text">{manualError}</span>}
              <div className="modal-actions">
                <button type="submit" className="duo-btn-primary" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Shop'}
                </button>
                <button
                  type="button"
                  className="duo-btn-secondary"
                  onClick={() => setShowManualForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
