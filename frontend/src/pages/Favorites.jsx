import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { FiStar, FiMapPin, FiTrash2 } from 'react-icons/fi';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
    const favoriteLocations = savedLocations.filter(location => location.isFavorite);
    setFavorites(favoriteLocations);
  }, []);

  const handleViewOnMap = (location) => {
    navigate('/map', {
      state: {
        coordinates: location.coordinates,
        name: location.name
      }
    });
  };

  const handleRemoveFromFavorites = (locationId) => {
    const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
    const updatedLocations = savedLocations.map(location => {
      if (location.id === locationId) {
        return { ...location, isFavorite: false };
      }
      return location;
    });
    localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
    
    // Update favorites state
    const updatedFavorites = favorites.filter(fav => fav.id !== locationId);
    setFavorites(updatedFavorites);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <IoArrowBack className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-[Afacad-B] text-gray-800 flex items-center">
                <FiStar className="w-6 h-6 text-red-500 mr-2" />
                Favorite Locations
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((location) => (
              <div
                key={location.id}
                className="group bg-white rounded-xl border border-gray-100 hover:border-red-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Card Header with Star Icon */}
                <div className="border-b border-gray-100 group-hover:border-red-100 transition-colors p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FiStar className="w-5 h-5 text-red-500 mr-2" />
                    <span className="font-medium text-gray-900">Favorite</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFromFavorites(location.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Remove from favorites"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-1">
                    {location.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Added on {formatDate(location.savedAt)}
                  </p>
                  <p className="text-gray-600 mb-6 line-clamp-2 h-12">
                    {location.address}
                  </p>

                  {/* View on Map Button */}
                  <button
                    onClick={() => handleViewOnMap(location)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg
                      hover:bg-red-600 transition-all duration-200 transform hover:-translate-y-0.5
                      focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:outline-none"
                  >
                    <FiMapPin className="w-4 h-4" />
                    <span>View on Map</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-16 px-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="w-16 h-16 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiStar className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Favorite Locations</h3>
              <p className="text-gray-500 mb-8">You haven't added any locations to your favorites yet.</p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 
                  transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <FiMapPin className="w-5 h-5 mr-2" />
                Add Locations
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites; 