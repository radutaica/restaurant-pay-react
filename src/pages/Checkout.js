// src/pages/Home.js
import React, {useState} from 'react';
import '../styles/Checkout.css'; // Import CSS for styling
import topImage from '../assets/brunch.jpg'; // Import your top image
import logo from '../assets/demo_logo.png'; // Import your logo
import TopImage from '../components/TopImage';

const Checkout = () => {

  const [isPressed, setIsPressed] = useState(false);
  const foodItems = [
    { id: 1, name: 'Burger', cost: '$5.99', quantity: 1 },
    { id: 2, name: 'Pizza', cost: '$8.99', quantity: 2 },
    { id: 3, name: 'Sushi', cost: '$12.50', quantity: 1 },
    { id: 4, name: 'Pasta', cost: '$7.25', quantity: 3 },
    { id: 5, name: 'Salad', cost: '$4.99', quantity: 1 },
  ];

  return (
    <div className="home-container">
     <TopImage 
        imageSrc={topImage}
        logoSrc={logo}
        logoSize={80} // You can change the logo size if needed
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: 15, paddingLeft: 15 }}>
        <div style={{ textAlign: 'left' }}>
            <p style = {{fontSize: 30, fontWeight: '500'}}>Pay your bill</p>
            <p style={{ color: '#909090', marginTop: '-20px' }}>Table Ground Floor: 34</p>
        </div>
        <div style={{display: 'flex', alignItems: 'flex-start'}}>
            <p style = {{fontSize: 30, fontWeight: '500'}}>$93.94</p>
        </div>
      </div>
      <ul>
      {foodItems.map((item) => (
        <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0'}}>
          <span>{item.name} ({item.quantity})</span>
          <span>{item.cost}</span>
        </li>
      ))}
      </ul>
      <p style={{
        display: 'flex', 
        alignItems: 'flex-end', 
        position: 'fixed', 
        bottom: 0, 
        width: '100%', 
        justifyContent: 'center',
        padding: '10px',
        backgroundColor: 'white'
      }}>
        Pay securely with Stripe
      </p>
      <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
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
          onClick={() => {setIsPressed(!isPressed)}}
        >
          Pay the bill
        </div>
      </div>
    </div>
  );
};

export default Checkout;
