import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';
import '@tomtom-international/web-sdk-maps/dist/maps.css';

const Map = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [map, setMap] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [marker, setMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize map
  useEffect(() => {
    const apiKey = import.meta.env.VITE_MAP_API;
    
    if (!apiKey) {
      console.error('TomTom API key is missing');
      setError('Map configuration error. Please try again later.');
      return;
    }

    try {
      console.log('Initializing map...');
      const mapInstance = tt.map({
        key: apiKey,
        container: 'map',
        center: location.state?.coordinates || [73.2090, 20.6139],
        zoom: location.state?.coordinates ? 15 : 5,
        style: 'https://api.tomtom.com/style/1/style/22.2.1-*?map=2/basic_street-light&key=' + apiKey
      });

      mapInstance.on('load', () => {
        console.log('Map loaded successfully');
        setMap(mapInstance);

        // Add click handler for manual location selection
        mapInstance.on('click', (event) => {
          const { lng, lat } = event.lngLat;
          addMarker([lng, lat]);
        });

        // If coordinates were passed, add marker
        if (location.state?.coordinates) {
          const [lng, lat] = location.state.coordinates;
          addMarker([lng, lat]);
        }
      });

      mapInstance.on('error', (error) => {
        console.error('Map error:', error);
        setError('Error loading map. Please check your internet connection and try again.');
      });

      return () => {
        if (marker) marker.remove();
        mapInstance.remove();
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please refresh the page.');
    }
  }, []);

  // Get address from coordinates
  const getAddressFromCoordinates = async (lng, lat) => {
    try {
      const apiKey = import.meta.env.VITE_MAP_API;
      const response = await ttapi.services.reverseGeocode({
        key: apiKey,
        position: {
          lon: lng,
          lat: lat
        }
      });
      if (response.addresses && response.addresses.length > 0) {
        return response.addresses[0].address;
      }
      return null;
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!map) {
      console.error('Map not initialized');
      setError('Map is not ready. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // First remove any existing marker
    if (marker) {
      marker.remove();
    }

    // Show loading popup in the center of the viewport
    const loadingPopup = new tt.Popup({ 
      closeButton: false,
      className: 'custom-popup',
      anchor: 'center'
    })
    .setLngLat(map.getCenter())
    .setHTML(`
      <div class="p-4 text-center bg-white rounded-lg">
        <div class="animate-pulse">
          <div class="text-lg font-semibold text-gray-700 mb-2">Getting your location...</div>
          <div class="text-sm text-gray-500">Please allow location access</div>
        </div>
      </div>
    `)
    .addTo(map);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      loadingPopup.remove();
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    const geolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    try {
      navigator.geolocation.getCurrentPosition(
        // Success callback
        async (position) => {
          try {
            const { longitude, latitude } = position.coords;
            console.log('Location found:', { longitude, latitude });
            
            // Remove loading popup
            loadingPopup.remove();

            // Center map on location immediately
            map.setCenter([longitude, latitude]);
            map.setZoom(15);

            // Add marker
            await addMarker([longitude, latitude]);

            // Show success message
            const successPopup = new tt.Popup({ 
              closeButton: false,
              className: 'custom-popup',
              anchor: 'top'
            })
            .setLngLat([longitude, latitude])
            .setHTML(`
              <div class="p-3 text-center bg-white rounded-lg">
                <div class="text-green-600 font-medium">Location found!</div>
              </div>
            `)
            .addTo(map);

            // Remove success popup after 2 seconds
            setTimeout(() => successPopup.remove(), 2000);

          } catch (err) {
            console.error('Error handling location:', err);
            loadingPopup.remove();
            setError('Error processing location. Please try again.');
          } finally {
            setIsLoading(false);
          }
        },
        // Error callback
        (error) => {
          console.error('Geolocation error:', error);
          loadingPopup.remove();
          setIsLoading(false);
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError('Please enable location access in your browser settings and try again.');
              break;
            case error.POSITION_UNAVAILABLE:
              setError('Location information is unavailable. Please check your device settings.');
              break;
            case error.TIMEOUT:
              setError('Location request timed out. Please try again.');
              break;
            default:
              setError('An error occurred while getting your location. Please try again.');
          }
        },
        geolocationOptions
      );
    } catch (e) {
      console.error('Unexpected error in getCurrentLocation:', e);
      loadingPopup.remove();
      setIsLoading(false);
      setError('Unexpected error accessing location services. Please try again.');
    }
  };

  // Add marker to map
  const addMarker = useCallback(async (coordinates) => {
    if (!map) return;
    if (!coordinates || !coordinates[0] || !coordinates[1]) {
      console.error('Invalid coordinates:', coordinates);
      return;
    }

    try {
      // Remove existing marker
      if (marker) {
        marker.remove();
      }

      // Ensure coordinates are numbers
      const lng = parseFloat(coordinates[0]);
      const lat = parseFloat(coordinates[1]);

      if (isNaN(lng) || isNaN(lat)) {
        console.error('Invalid coordinate values:', { lng, lat });
        return;
      }

      // Get address for the location
      const address = await getAddressFromCoordinates(lng, lat);
      
      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.innerHTML = `
        <div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg relative">
          <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div class="w-2 h-2 bg-red-500 rotate-45 transform origin-top"></div>
          </div>
        </div>
      `;

      // Create new marker
      const newMarker = new tt.Marker({
        element: markerElement,
        anchor: 'bottom',
        draggable: true
      })
      .setLngLat([lng, lat])
      .addTo(map);

      // Handle marker drag
      newMarker.on('dragend', async () => {
        const position = newMarker.getLngLat();
        const newAddress = await getAddressFromCoordinates(position.lng, position.lat);
        setSelectedLocation({
          coordinates: [position.lng, position.lat],
          address: newAddress
        });
        setShowDialog(true);
      });

      setMarker(newMarker);
      setSelectedLocation({
        coordinates: [lng, lat],
        address
      });
      setShowDialog(true);
    } catch (err) {
      console.error('Error adding marker:', err);
      setError('Error placing marker. Please try again.');
    }
  }, [map, marker]);

  // Handle search
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

  const handleResultClick = async (result) => {
    const { position } = result;
    const longitude = position.lon || position.lng;
    const latitude = position.lat;
    
    if (!longitude || !latitude) {
      console.error('Invalid coordinates:', position);
      return;
    }

    const coordinates = [longitude, latitude];
    map.flyTo({
      center: coordinates,
      zoom: 14
    });
    
    await addMarker(coordinates);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSaveLocation = () => {
    if (selectedLocation) {
      // Get existing saved locations
      const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
      
      // Create new location
      const newLocation = {
        id: Date.now(),
        name: selectedLocation.address?.freeformAddress || 'Unnamed Location',
        address: selectedLocation.address?.freeformAddress || 'Address not found',
        coordinates: selectedLocation.coordinates,
        isFavorite: false,
        savedAt: new Date().toISOString()
      };

      // Save location
      savedLocations.push(newLocation);
      localStorage.setItem('savedLocations', JSON.stringify(savedLocations));

      // Add to recent locations
      const recentLocations = JSON.parse(localStorage.getItem('recentLocations') || '[]');
      recentLocations.unshift({
        id: Date.now(),
        address: selectedLocation.address?.freeformAddress || 'Address not found',
        coordinates: selectedLocation.coordinates,
        visitedAt: new Date().toISOString()
      });

      // Keep only last 10 recent locations
      while (recentLocations.length > 10) {
        recentLocations.pop();
      }

      localStorage.setItem('recentLocations', JSON.stringify(recentLocations));
      setShowDialog(false);
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Header with search */}
      <div className="fixed top-0 left-0 right-0 z-20 px-2 py-3 sm:px-4 sm:py-4 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4">
          {/* Back button */}
          <button 
            onClick={() => navigate('/')}
            className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white rounded-full shadow hover:shadow-md transition-all duration-200 active:scale-95"
          >
            <IoArrowBack className="text-gray-700 text-lg sm:text-xl" />
          </button>

          {/* Search container */}
          <div className="flex-1 relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                placeholder="Search for a place in India"
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 sm:py-2.5 bg-white rounded-xl shadow-sm border border-gray-200 
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
                          text-sm sm:text-base placeholder-gray-400"
              />
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg overflow-hidden z-30">
                <ul className="max-h-[40vh] sm:max-h-[50vh] overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <li 
                      key={index} 
                      onClick={() => handleResultClick(result)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0
                                text-sm sm:text-base transition-colors duration-150"
                    >
                      {result.poi ? result.poi.name : result.address.freeformAddress}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow-md">
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div 
        id="map" 
        className="fixed inset-0 z-0"
        style={{ top: '60px' }}
      ></div>

      {/* Location details modal */}
      {showDialog && selectedLocation && (
        <div className="fixed inset-x-0 bottom-0 z-30 animate-slideUp">
          <div className="bg-white rounded-t-2xl shadow-lg max-h-[70vh] overflow-y-auto">
            <div className="max-w-2xl mx-auto p-4 sm:p-6">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Selected Location
                </h3>
                <button 
                  onClick={() => setShowDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-150"
                >
                  <span className="text-gray-500 text-lg">✕</span>
                </button>
              </div>

              {/* Location details */}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="font-medium text-gray-700 mb-1">Address:</p>
                  <p className="text-gray-600 break-words">
                    {selectedLocation.address?.freeformAddress || 'Address not found'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1">Coordinates:</p>
                  <div className="space-y-1 text-sm sm:text-base text-gray-600">
                    <p>Latitude: {selectedLocation.coordinates[1].toFixed(6)}</p>
                    <p>Longitude: {selectedLocation.coordinates[0].toFixed(6)}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-end">
                <button 
                  onClick={() => setShowDialog(false)}
                  className="order-2 sm:order-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 
                           text-gray-700 rounded-lg transition-colors duration-200
                           text-sm sm:text-base font-medium"
                >
                  Close
                </button>
                <button 
                  onClick={handleSaveLocation}
                  className="order-1 sm:order-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 
                           text-white rounded-lg transition-colors duration-200
                           text-sm sm:text-base font-medium"
                >
                  Save Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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