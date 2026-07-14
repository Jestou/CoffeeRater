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

// Create custom active marker icon (e.g. coffee colored or highlighted)
const activeIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'active-leaflet-marker'
});

// Custom icon for the 123 Albert Street starting location
const originIcon = L.divIcon({
  html: `<div style="background-color: #7A4B27; width: 14px; height: 14px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  className: 'origin-marker-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 15); // Slightly closer zoom for city walkability
  return null;
}

const MapView = ({ selectedShop, shops }) => {
  // Center map on selected coffee shop, or default to 123 Albert Street, Brisbane
  const ALBERT_ST_COORDS = [-27.47093, 153.02648];
  const center = selectedShop ? [selectedShop.lat, selectedShop.lng] : ALBERT_ST_COORDS;

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Origin Marker: 123 Albert Street */}
        <Marker position={ALBERT_ST_COORDS} icon={originIcon}>
          <Popup>
            <strong>123 Albert Street</strong><br />
            Starting Location (Origin)
          </Popup>
        </Marker>

        {shops.map(shop => {
          const isSelected = selectedShop && selectedShop.id === shop.id;
          return (
            <Marker
              key={shop.id}
              position={[shop.lat, shop.lng]}
              icon={isSelected ? activeIcon : L.Icon.Default.prototype}
            >
              <Popup>
                <strong>{shop.name}</strong>
                <br />
                Value Score: {shop.compositeScore}/10
                <br />
                {shop.distance}m walk
              </Popup>
            </Marker>
          );
        })}

        {selectedShop && <ChangeView center={[selectedShop.lat, selectedShop.lng]} />}
      </MapContainer>
    </div>
  );
};

export default MapView;
