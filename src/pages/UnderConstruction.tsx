// src/pages/UnderConstruction.js
import React from 'react';

const UnderConstruction: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen text-center p-5 bg-gray-100">
      <div>
        <h1 className="text-3xl font-bold mb-4">🚧 Website Under Construction 🚧</h1>
        <p className="text-lg mb-2">We're working hard to bring you the web version of our app.</p>
        <p className="text-lg">Please check back later or use our mobile app for the best experience!</p>
      </div>
    </div>
  );
};

export default UnderConstruction;
