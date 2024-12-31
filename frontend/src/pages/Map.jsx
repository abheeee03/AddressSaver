import React, { useEffect, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';
import '@tomtom-international/web-sdk-maps/dist/maps.css';

const Map = () => {
  const [map, setMap] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const apiKey = import.meta.env.VITE_MAP_API;
    const mapInstance = tt.map({
      key: apiKey,
      container: 'map',
      center: [73.2090, 20.6139],
      zoom: 10
    });
    setMap(mapInstance);

    return () => mapInstance.remove();
  }, []);

  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }

      const apiKey = import.meta.env.VITE_MAP_API;
      ttapi.services.fuzzySearch({
        key: apiKey,
        query: query,
        countrySet: 'IN',
        limit: 5
      })
      .then(response => {
        console.log('Search results:', response.results);
        setSearchResults(response.results);
      })
      .catch(error => {
        console.error('Search error:', error);
        setSearchResults([]);
      });
    }, 300),
    []
  );

  const handleSearch = (value) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleResultClick = (result) => {
    const { position } = result;
    const longitude = position.lon || position.lng;
    const latitude = position.lat;
    
    if (!longitude || !latitude || typeof longitude !== 'number' || typeof latitude !== 'number') {
      console.error('Invalid coordinates:', position);
      return;
    }

    try {
      map.flyTo({
        center: [longitude, latitude],
        zoom: 14
      });
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error flying to location:', error);
    }
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <input
          type="text"
          value={searchQuery}
          placeholder="Search for a place in India"
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.map((result, index) => (
              <li 
                key={index} 
                onClick={() => handleResultClick(result)}
                className="search-result-item"
              >
                {result.poi ? result.poi.name : result.address.freeformAddress}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div id="map" style={{ width: '100%', height: '100vh' }}></div>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default Map; 