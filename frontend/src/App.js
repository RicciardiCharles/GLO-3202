import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Register from './Register';
import Login from './Login';
import Home from './Home';
import Profile from './Profile';
import Gallery from './Gallery';

// Déclaration des routes de l'application
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/gallery" element={<Gallery/>} />
      </Routes>
    </Router>
  );
}

export default App;
