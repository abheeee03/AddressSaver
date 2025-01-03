import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Map from './pages/Map';
import Home from './pages/Home';
import Welcome from './pages/Welcome';
import Favorites from './pages/Favorites';
import AddAddress from './pages/AddAddress';
import { checkAuth } from './utils/auth';

const PrivateRoute = ({ children }) => {
  return checkAuth() ? children : <Navigate to="/welcome" />;
};

const PublicRoute = ({ children }) => {
  return !checkAuth() ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <Router>
      <div className="w-full min-h-screen font-[Afacad]">
        <Routes>
          <Route
            path="/welcome"
            element={
              <PublicRoute>
                <Welcome />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/map"
            element={
              <PrivateRoute>
                <Map />
              </PrivateRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-address"
            element={
              <PrivateRoute>
                <AddAddress />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;