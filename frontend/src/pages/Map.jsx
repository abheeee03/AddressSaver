import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { logout } from '../utils/auth';

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

  // Function to get current location
  const getCurrentLocation = () => {
    setIsLoading(true);
    setError(null);

    // First check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    // Check if permission is already granted
    navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
      console.log('Geolocation permission status:', permissionStatus.state);
      
      if (permissionStatus.state === 'denied') {
        setError('Location access is blocked. Please enable location access in your browser settings.');
        setIsLoading(false);
        return;
      }

      // Geolocation options
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      // Success callback
      const success = async (position) => {
        try {
          console.log('Got position:', position);
          const { longitude, latitude } = position.coords;
          
          if (map) {
            console.log('Flying to coordinates:', [longitude, latitude]);
            map.flyTo({
              center: [longitude, latitude],
              zoom: 14
            });
            
            await addMarker([longitude, latitude]);
          } else {
            console.error('Map not initialized');
            setError('Map not initialized. Please try again.');
          }
        } catch (err) {
          console.error('Error in success callback:', err);
          setError('Error processing location data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      // Error callback
      const error = (err) => {
        console.error('Geolocation error:', err);
        setIsLoading(false);
        
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            setError('Location permission denied. Please allow location access and try again.');
            break;
          case 2: // POSITION_UNAVAILABLE
            setError('Unable to determine your location. Please try again or check your device settings.');
            break;
          case 3: // TIMEOUT
            setError('Location request timed out. Please check your internet connection and try again.');
            break;
          default:
            setError('An unknown error occurred while trying to get your location.');
        }
      };

      // Get current position with error handling
      try {
        const watchId = navigator.geolocation.watchPosition(success, error, options);
        
        // Cleanup the watch after 10 seconds or on success
        setTimeout(() => {
          navigator.geolocation.clearWatch(watchId);
          if (isLoading) {
            setIsLoading(false);
            setError('Location request timed out. Please try again.');
          }
        }, 10000);
      } catch (e) {
        console.error('Error requesting location:', e);
        setIsLoading(false);
        setError('Error requesting location. Please try again.');
      }
    }).catch(err => {
      console.error('Permission query error:', err);
      setIsLoading(false);
      setError('Error checking location permissions. Please ensure location access is enabled.');
    });
  };

  // Function to get address from coordinates
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

  const addMarker = useCallback(async (coordinates) => {
    if (!map) return;
    
    if (marker) {
      marker.remove();
    }

    // Get address for the location
    const address = await getAddressFromCoordinates(coordinates[0], coordinates[1]);
    
    // Create marker
    const newMarker = new tt.Marker()
      .setLngLat(coordinates)
      .addTo(map);

    // Add drag functionality
    newMarker.setDraggable(true);

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
      coordinates,
      address
    });
    setShowDialog(true);
  }, [map, marker]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_MAP_API;
    const mapInstance = tt.map({
      key: apiKey,
      container: 'map',
      center: location.state?.coordinates || [73.2090, 20.6139],
      zoom: location.state?.coordinates ? 14 : 10,
      style: 'https://api.tomtom.com/style/1/style/22.2.1-*?map=2/basic_street-light&key=' + apiKey
    });

    setMap(mapInstance);

    // Wait for map to load before adding marker and click handler
    mapInstance.on('load', () => {
      // Check if we should get current location
      if (location.state?.useCurrentLocation) {
        getCurrentLocation();
      }
      // Add marker if coordinates were passed
      else if (location.state?.coordinates) {
        const [lng, lat] = location.state.coordinates;
        addMarker([lng, lat]);
      }

      // Add click handler for manual location selection
      mapInstance.on('click', (event) => {
        const { lng, lat } = event.lngLat;
        addMarker([lng, lat]);
      });
    });

    return () => {
      if (marker) marker.remove();
      mapInstance.remove();
    };
  }, [location.state?.coordinates, location.state?.useCurrentLocation]);

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

  const handleResultClick = async (result) => {
    const { position } = result;
    const longitude = position.lon || position.lng;
    const latitude = position.lat;
    
    if (!longitude || !latitude || typeof longitude !== 'number' || typeof latitude !== 'number') {
      console.error('Invalid coordinates:', position);
      return;
    }

    try {
      const coordinates = [longitude, latitude];
      map.flyTo({
        center: coordinates,
        zoom: 14
      });
      
      await addMarker(coordinates);
      
      setSearchResults([]);
      setSearchQuery('');
      setSelectedLocation({
        coordinates,
        address: result.address
      });
      setShowDialog(true);
    } catch (error) {
      console.error('Error flying to location:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/welcome');
  };

  const handleSaveLocation = () => {
    if (selectedLocation) {
      // Get existing saved locations from localStorage
      const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
      
      // Create new location object
      const newLocation = {
        id: Date.now(),
        name: selectedLocation.address?.freeformAddress || 'Unnamed Location',
        address: selectedLocation.address?.freeformAddress || 'Address not found',
        coordinates: selectedLocation.coordinates,
        isFavorite: false,
        savedAt: new Date().toISOString()
      };

      // Add to saved locations
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
      navigate('/'); // Return to home after saving
    }
  };

  return (
    <div className="relative h-screen w-full bg-gray-50">
      {/* Header with search */}
      <div className="absolute top-0 left-0 right-0 z-20 px-2 py-3 sm:px-4 sm:py-4 bg-white/90 backdrop-blur-sm shadow-sm">
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

            {/* Search results dropdown */}
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

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-white px-4 py-2 rounded-lg shadow-md">
            <p className="text-gray-600">Getting your location...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow-md">
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div id="map" className="h-screen w-full"></div>

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