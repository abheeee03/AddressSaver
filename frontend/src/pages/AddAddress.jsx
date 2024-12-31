import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

const AddAddress = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home', // home, work, other
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.name || !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill in all required fields');
      return;
    }

    // Create address string for geocoding
    const addressString = `${formData.addressLine1}, ${formData.addressLine2 ? formData.addressLine2 + ', ' : ''}${formData.landmark ? formData.landmark + ', ' : ''}${formData.city}, ${formData.state}, ${formData.pincode}`;

    // Get existing saved locations
    const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');

    // Create new location object
    const newLocation = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      address: addressString,
      addressDetails: {
        ...formData
      },
      isFavorite: false,
      savedAt: new Date().toISOString()
    };

    // Add to saved locations
    savedLocations.push(newLocation);
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));

    // Navigate back to home
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <IoArrowBack className="text-gray-700 text-xl" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Add New Address</h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., My Home, Office"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Type *
              </label>
              <div className="flex gap-4">
                {['home', 'work', 'other'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Address Line 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="House/Flat/Block No., Street"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Apartment, Suite, Building (Optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Landmark
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="Nearby landmark (Optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* City and State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode *
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                maxLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Save Address
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddAddress; 