import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with:', { email });
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data);
      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Server connection failed. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-16 sm:h-20">
              <Link 
                to='/' 
                className='text-2xl sm:text-3xl font-[Afacad-B] text-gray-800 hover:text-red-500 transition-colors duration-200'
              >
                Address Saver
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-10">
          <h2 className='text-3xl sm:text-4xl font-[Afacad-B] text-center text-gray-800 mb-8'>Login</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700">Email</label>
              <input
                className="w-full px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-200"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <button 
              className="w-full py-3 sm:py-4 px-6 text-base sm:text-lg text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg font-medium"
              type="submit"
            >
              Login
            </button>

            <p className="text-center text-gray-600 text-base sm:text-lg">
              Don't have an account?{' '}
              <Link 
                className='text-red-500 hover:text-red-600 font-medium transition-colors duration-200' 
                to="/register"
              >
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;