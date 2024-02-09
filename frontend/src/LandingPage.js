import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome to my Canvas</h1>
      <div className="text-lg">
        <Link to="/register" className="text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out">Register</Link>
        <span className="text-gray-500 mx-2">|</span>
        <Link to="/login" className="text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out">Login</Link>
      </div>
    </div>
  );
}

export default LandingPage;
