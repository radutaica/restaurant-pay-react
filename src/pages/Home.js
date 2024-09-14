// src/pages/Home.js
import React from 'react';
import './Home.css'; // Import the CSS file for styling
import topImage from '../assets/brunch.jpg'

const Home = () => {
  return (
    <div className="home-container">
      <img 
        src={topImage} 
        alt="Top of the page" 
        className="home-image" 
      />
      <h1>Welcome to the Home Page</h1>
      <p>This is the first page a user sees when they visit your site.</p>
    </div>
  );
};

export default Home;
