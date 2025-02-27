// src/pages/Home.js
import React, {useState} from 'react';
import '../styles/Home.css'; // Import CSS for styling
import topImage from '../assets/brunch.jpg'; // Import your top image
import logo from '../assets/demo_logo.png'; // Import your logo
import TopImage from '../components/TopImage';
import { useNavigate } from 'react-router-dom';
import MainButton from '../components/MainButton';

const Home = () => {

  const [isPressed, setIsPressed] = useState(false);
  const navigate = useNavigate(); 

  return (
    <div className="home-container">
     <TopImage 
        imageSrc={topImage}
        logoSrc={logo}
        logoSize={80} // You can change the logo size if needed
      />
      <div className="content">
        <p style= {{color: '#909090'}}>Table Ground Floor: 34</p>
        <h1>Welcome to the fastest way to pay </h1>
      </div>
      <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20%'}}>
        <MainButton 
          text="Pay the bill" 
          onPress={() => {
            setIsPressed(!isPressed); 
            navigate('/checkout');
          }} 
        />
      </div>
      <p style={{
        display: 'flex', 
        alignItems: 'flex-end', 
        position: 'fixed', 
        bottom: 10, 
        left: -10,
        width: '100%', 
        justifyContent: 'center',
        padding: '10px',
        backgroundColor: 'transparent'
      }}>
        Pay securely with Stripe
      </p>
    </div>
  );
};

export default Home;
