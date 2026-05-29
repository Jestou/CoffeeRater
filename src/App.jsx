import { useState, useMemo } from 'react'
import Sidebar from './components/Sidebar'
import MapView from './components/MapView'
import ShopDetail from './components/ShopDetail'
import { INITIAL_SHOPS } from './initialData'
import { calculateAverageRating } from './utils'
import './App.css'

function App() {
  const [shops, setShops] = useState(INITIAL_SHOPS);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [sortOrder, setSortOrder] = useState({ type: 'alpha', direction: 'asc' });

  const selectedShop = useMemo(() =>
    shops.find(s => s.id === selectedShopId),
    [shops, selectedShopId]
  );

  const sortedShops = useMemo(() => {
    return [...shops].sort((a, b) => {
      if (sortOrder.type === 'alpha') {
        return a.name.localeCompare(b.name);
      } else {
        return calculateAverageRating(b.ratings) - calculateAverageRating(a.ratings);
      }
    });
  }, [shops, sortOrder]);

  const handleAddShop = (newShop) => {
    setShops([...shops, newShop]);
    setSelectedShopId(newShop.id);
  };

  const handleAddRating = (shopId, rating) => {
    setShops(shops.map(shop => {
      if (shop.id === shopId) {
        return { ...shop, ratings: [...shop.ratings, rating] };
      }
      return shop;
    }));
  };

  const handleSort = (type) => {
    setSortOrder({ type, direction: 'asc' });
  };

  return (
    <div className="app-container">
      <Sidebar
        shops={sortedShops}
        onSelectShop={(shop) => setSelectedShopId(shop.id)}
        selectedShopId={selectedShopId}
        onSort={handleSort}
        sortOrder={sortOrder}
      />
      <main className="main-content">
        <div className="top-section">
          <MapView selectedShop={selectedShop} shops={shops} />
        </div>
        <div className="bottom-section">
          <ShopDetail
            shop={selectedShop}
            onAddRating={handleAddRating}
            onAddShop={handleAddShop}
          />
        </div>
      </main>
    </div>
  )
}

export default App
