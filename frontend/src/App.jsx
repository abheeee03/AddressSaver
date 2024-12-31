import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Map from './pages/Map';
import { checkAuth } from './utils/auth';

const PrivateRoute = ({ children }) => {
  return checkAuth() ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Map />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;