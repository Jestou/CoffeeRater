import { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import ShopDetail from './components/ShopDetail';
import './App.css';

function App() {
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [sortOrder, setSortOrder] = useState({ type: 'compositeScore', direction: 'desc' });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch shops on component mount
  useEffect(() => {
    async function loadShops() {
      try {
        const response = await fetch('/api/shops');
        if (response.ok) {
          const data = await response.json();
          setShops(data);
          // Auto-select the highest rated or first shop if available
          if (data.length > 0) {
            setSelectedShopId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading initial shops:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadShops();
  }, []);

  const selectedShop = useMemo(() =>
    shops.find(s => s.id === selectedShopId),
    [shops, selectedShopId]
  );

  const sortedShops = useMemo(() => {
    return [...shops].sort((a, b) => {
      if (sortOrder.type === 'alpha') {
        return a.name.localeCompare(b.name);
      } else if (sortOrder.type === 'distance') {
        return a.distance - b.distance;
      } else {
        // default: sort by compositeScore descending
        return b.compositeScore - a.compositeScore;
      }
    });
  }, [shops, sortOrder]);

  const handleAddShop = (newShop) => {
    setShops(prevShops => [...prevShops, newShop]);
    setSelectedShopId(newShop.id);
  };

  const handleUpdateRating = (updatedShop) => {
    setShops(prevShops =>
      prevShops.map(shop => (shop.id === updatedShop.id ? updatedShop : shop))
    );
  };

  const handleSort = (type) => {
    setSortOrder({ type, direction: 'desc' });
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#FAF6F0',
        color: '#7A4B27',
        fontFamily: 'sans-serif'
      }}>
        <div className="loader-mini" style={{ width: '40px', height: '40px', position: 'static', marginBottom: '16px' }} />
        <h2 style={{ fontWeight: '800' }}>Pouring Coffee Rater...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        shops={sortedShops}
        onSelectShop={(shop) => setSelectedShopId(shop.id)}
        selectedShopId={selectedShopId}
        onSort={handleSort}
        sortOrder={sortOrder}
        onAddShop={handleAddShop}
      />
      <main className="main-content">
        <div className="top-section">
          <MapView selectedShop={selectedShop} shops={shops} />
        </div>
        <div className="bottom-section">
          <ShopDetail
            shop={selectedShop}
            onAddRating={handleUpdateRating}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
