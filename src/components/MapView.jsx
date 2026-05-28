import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issues in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

const MapView = ({ selectedShop, shops }) => {
  const center = selectedShop ? [selectedShop.location.lat, selectedShop.location.lng] : [51.505, -0.09];

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {shops.map(shop => (
          <Marker key={shop.id} position={[shop.location.lat, shop.location.lng]}>
            <Popup>
              <strong>{shop.name}</strong>
            </Popup>
          </Marker>
        ))}
        {selectedShop && <ChangeView center={[selectedShop.location.lat, selectedShop.location.lng]} />}
      </MapContainer>
    </div>
  );
};

export default MapView;
