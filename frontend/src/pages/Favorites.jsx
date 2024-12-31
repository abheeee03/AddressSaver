import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { FiStar, FiMapPin, FiSearch } from 'react-icons/fi';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date'

  useEffect(() => {
    // Load saved locations and filter favorites
    const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
    const favoriteLocations = savedLocations.filter(location => location.isFavorite);
    setFavorites(favoriteLocations);
  }, []);

  const handleLocationClick = (coordinates) => {
    navigate('/map', { 
      state: { 
        coordinates: coordinates 
      } 
    });
  };

  const toggleFavorite = (locationId) => {
    // Get all saved locations
    const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
    const updatedLocations = savedLocations.map(location => {
      if (location.id === locationId) {
        return { ...location, isFavorite: !location.isFavorite };
      }
      return location;
    });
    
    // Update localStorage
    localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
    
    // Update favorites list
    const updatedFavorites = updatedLocations.filter(location => location.isFavorite);
    setFavorites(updatedFavorites);
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

  const filteredFavorites = favorites.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'date') {
      return new Date(b.savedAt) - new Date(a.savedAt);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <IoArrowBack className="text-gray-700 text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FiStar className="text-yellow-400" />
              Favorite Locations
            </h1>
          </div>
        </div>
      </header>

      {/* Search and Sort Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>

        {/* Favorites List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedFavorites.map((location) => (
            <div 
              key={location.id}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col"
            >
              <button 
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => toggleFavorite(location.id)}
              >
                <FiStar className="w-5 h-5 text-yellow-400" />
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
                  onClick={() => handleLocationClick(location.coordinates)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg 
                            hover:bg-blue-600 transition-all duration-200 transform hover:translate-y-[-1px] 
                            focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                >
                  <FiMapPin />
                  View on Map
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedFavorites.length === 0 && (
          <div className="text-center py-12">
            <FiStar className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            {searchQuery ? (
              <p className="text-gray-500">No favorites match your search</p>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-500">No favorite locations yet</p>
                <button 
                  onClick={() => navigate('/')}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Go back and add some favorites
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites; 