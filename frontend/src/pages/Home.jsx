import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { FiMapPin, FiClock, FiPlus, FiNavigation, FiSearch, FiStar } from "react-icons/fi";
import { logout } from '../utils/auth';

const Home = () => {
  const navigate = useNavigate();
  const [savedLocations, setSavedLocations] = useState([]);
  const [recentLocations, setRecentLocations] = useState([]);
  const [activeTab, setActiveTab] = useState('saved');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

  // Get favorite locations
  const getFavoriteLocations = () => {
    return savedLocations.filter(location => location.isFavorite);
  };

  useEffect(() => {
    // Load saved locations from localStorage
    const loadedSavedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
    setSavedLocations(loadedSavedLocations);

    // Load recent locations from localStorage
    const loadedRecentLocations = JSON.parse(localStorage.getItem('recentLocations') || '[]');
    setRecentLocations(loadedRecentLocations);
  }, []);

  const toggleFavorite = (locationId) => {
    const updatedLocations = savedLocations.map(location => {
      if (location.id === locationId) {
        return { ...location, isFavorite: !location.isFavorite };
      }
      return location;
    });
    setSavedLocations(updatedLocations);
    localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLocationClick = (coordinates) => {
    console.log('Navigating to coordinates:', coordinates);
    navigate('/map', { 
      state: { 
        coordinates: coordinates 
      } 
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/welcome');
  };

  // Close profile menu and favorites when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
        setShowFavorites(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleAddLocation = (e) => {
    e.preventDefault(); // Prevent navigation
    setShowLocationModal(true);
  };

  const handleUseCurrentLocation = () => {
    setShowLocationModal(false);
    navigate('/map', { 
      state: { 
        useCurrentLocation: true 
      } 
    });
  };

  const handleManualLocation = () => {
    setShowLocationModal(false);
    navigate('/map', { 
      state: { 
        useCurrentLocation: false 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Address Saver
            </h1>
            
            <div className="relative profile-menu-container">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <CgProfile className="w-6 h-6 text-gray-600" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-lg py-1 z-50 border border-gray-100 transform transition-all duration-200 ease-out">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userEmail}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/favorites')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center"
                  >
                    <FiStar className="w-4 h-4 mr-2 text-yellow-400" />
                    Favorite Locations
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    Sign out
                  </button>
                </div>
              )}

              {/* Favorites Modal */}
              {showFavorites && showProfileMenu && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-lg z-50 border border-gray-100 transform transition-all duration-200 ease-out">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FiStar className="w-5 h-5 mr-2 text-yellow-400" />
                        Favorite Locations
                      </h3>
                      <button 
                        onClick={() => setShowFavorites(false)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-150"
                      >
                        <span className="text-gray-500 text-lg">✕</span>
                      </button>
                    </div>
                    
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                      {getFavoriteLocations().length > 0 ? (
                        getFavoriteLocations().map((location) => (
                          <div 
                            key={location.id}
                            className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-150"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-800">{location.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                              </div>
                              <button
                                onClick={() => handleLocationClick(location.coordinates)}
                                className="shrink-0 ml-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors duration-150"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          No favorite locations yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button 
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium
              ${activeTab === 'saved' 
                ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('saved')}
          >
            <FiMapPin className={`mr-2 ${activeTab === 'saved' ? 'text-white' : 'text-blue-500'}`} />
            Saved Locations
          </button>
          <button 
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium
              ${activeTab === 'recent' 
                ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('recent')}
          >
            <FiClock className={`mr-2 ${activeTab === 'recent' ? 'text-white' : 'text-blue-500'}`} />
            Recent Locations
          </button>
        </div>

        <main>
          {activeTab === 'saved' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              <button 
                onClick={handleAddLocation}
                className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-blue-300 hover:border-blue-500"
              >
                <div className="p-4 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-200">
                  <FiPlus className="w-8 h-8 text-blue-500" />
                </div>
                <p className="mt-4 text-gray-600 group-hover:text-gray-800 font-medium transition-colors duration-200">Add New Location</p>
              </button>

              {savedLocations.map((location) => (
                <div 
                  key={location.id} 
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col group"
                >
                  <button 
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(location.id);
                    }}
                  >
                    <span className="text-xl">{location.isFavorite ? '⭐' : '☆'}</span>
                  </button>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 pr-10">
                    {location.name}
                  </h3>
                  <p className="text-gray-600 mb-3 flex-grow">
                    {location.address}
                  </p>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                      Saved: {formatDate(location.savedAt)}
                    </p>
                    <button 
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:translate-y-[-1px] focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                      onClick={() => handleLocationClick(location.coordinates)}
                    >
                      View on Map
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentLocations.map((location) => (
                <div 
                  key={location.id} 
                  className="bg-white p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-grow space-y-2">
                      <p className="text-gray-800 font-medium leading-relaxed">
                        {location.address}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <FiClock className="mr-2" />
                        {formatDate(location.visitedAt)}
                      </p>
                    </div>
                    <button 
                      className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:translate-y-[-1px] focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                      onClick={() => handleLocationClick(location.coordinates)}
                    >
                      View on Map
                    </button>
                  </div>
                </div>
              ))}
              
              {recentLocations.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No recent locations found</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Add New Location
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleUseCurrentLocation}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <FiNavigation className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-gray-700 font-medium">Use Current Location</span>
                </div>
                <FiMapPin className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={handleManualLocation}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <FiSearch className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-gray-700 font-medium">Enter Location Manually</span>
                </div>
                <FiMapPin className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <button
              onClick={() => setShowLocationModal(false)}
              className="w-full mt-4 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 