import React from 'react';

// Placeholder map view; replace with react-leaflet implementation when ready.
const MapView = ({ listings = [] }) => {
  return (
    <div className="map-view">
      <p>Map view placeholder. {listings.length} listings available.</p>
    </div>
  );
};

export default MapView;
