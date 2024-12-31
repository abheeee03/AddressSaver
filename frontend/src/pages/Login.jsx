import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

// Change the component declaration to use default export
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with:', { email });
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data);
      const { token } = response.data;
      localStorage.setItem('token', token);
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
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

// Make sure to add this line at the end
export default Login;