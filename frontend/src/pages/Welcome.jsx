import React from 'react';
import { Link } from 'react-router-dom';
import Globe from '../components/Globe';

const Welcome = () => {
  return (
    <div className="relative w-full bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4">
            {/* Logo */}
            <Link 
              to='/' 
              className='text-2xl sm:text-3xl font-[Afacad-B] text-gray-800 hover:text-red-500 transition-colors'
            >
              Address Saver
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Link 
                to='/login' 
                className='px-6 py-2 text-sm sm:text-base font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors'
              >
                Sign in
              </Link>
              <Link 
                to='/register' 
                className='px-6 py-2 text-sm sm:text-base font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors'
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="h-screen w-full">
        <div className="container mx-auto">
          {/* Hero Section */}
          <section className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl mt-40 font-[Afacad-EB] text-gray-900 mb-4">
                Welcome to <span className="text-red-500">Address Saver</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Save and manage your locations with ease. Access them anytime, anywhere.
              </p>
            </div>

            {/* Globe Container */}
            <div className="max-w-md mx-auto mb-20">
              <div className="aspect-square w-[240px] sm:w-[280px] lg:w-[320px] mx-auto">
                <Globe />
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">📍</div>
                <h3 className="text-xl font-[Afacad-B] text-gray-800 mb-3">Save Locations</h3>
                <p className="text-gray-600">Save your important addresses with custom names and descriptions for easy reference.</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-xl font-[Afacad-B] text-gray-800 mb-3">Favorite Places</h3>
                <p className="text-gray-600">Mark your most visited places as favorites for quick access and better organization.</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">🔄️</div>
                <h3 className="text-xl font-[Afacad-B] text-gray-800 mb-3">Interactive Map</h3>
                <p className="text-gray-600">View all your saved locations on an interactive map with current location support.</p>
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="max-w-3xl mx-auto text-center py-16 mt-16 border-t">
            <h2 className="text-3xl font-[Afacad-B] text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of users who trust Address Saver for managing their important locations.
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-3 text-lg font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Create Free Account
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Welcome;