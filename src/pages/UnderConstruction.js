// src/pages/UnderConstruction.js
import React from 'react';

const UnderConstruction = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f0f0f0'  // Optional: adds a light background color for better visibility
    }}>
      <div>
        <h1>🚧 Website Under Construction 🚧</h1>
        <p>We're working hard to bring you the web version of our app.</p>
        <p>Please check back later or use our mobile app for the best experience!</p>
      </div>
    </div>
  );
};

export default UnderConstruction;
