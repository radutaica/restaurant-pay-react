// src/pages/Home.js
import React, {useState} from 'react';
import '../styles/Home.css'; // Import CSS for styling
import topImage from '../assets/brunch.jpg'; // Import your top image
import logo from '../assets/demo_logo.png'; // Import your logo
import TopImage from '../components/TopImage';
import { useNavigate } from 'react-router-dom';

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
        <div
          style={{
            opacity: isPressed ? 0.2 : 1,
            width: '80%',
            backgroundColor: 'black',
            padding: '20px 20px',
            borderRadius: '30px',
            color: 'white',
            textAlign: 'center',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => {
            setIsPressed(!isPressed);
            navigate('/checkout'); // Navigate to Checkout page
          }}
        >
          Pay the bill
        </div>
      </div>
      <p style={{
        display: 'flex', 
        alignItems: 'flex-end', 
        position: 'fixed', 
        bottom: 0, 
        left: -10,
        width: '100%', 
        justifyContent: 'center',
        padding: '10px',
        backgroundColor: 'white'
      }}>
        Pay securely with Stripe
      </p>
    </div>
  );
};

export default Home;
