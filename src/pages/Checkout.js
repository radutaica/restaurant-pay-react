// src/pages/Home.js
import React, {useState} from 'react';
import '../styles/Checkout.css'; // Import CSS for styling
import topImage from '../assets/brunch.jpg'; // Import your top image
import logo from '../assets/demo_logo.png'; // Import your logo
import TopImage from '../components/TopImage';
import { MdOutlineSubdirectoryArrowRight } from "react-icons/md";
import { useNavigate } from 'react-router-dom';


const Checkout = () => {
  const navigate = useNavigate(); 
  const [isPressed, setIsPressed] = useState(false);
  const foodItems = [
    { id: 1, name: 'Burger', cost: 5.99, quantity: 1, extra: 'Add Bacon', extra_cost: 3.50 },
    { id: 2, name: 'Pizza', cost: 8.99, quantity: 2 },
    { id: 3, name: 'Sushi', cost: 12.50, quantity: 1 },
    { id: 4, name: 'Pasta', cost: 7.25, quantity: 3 },
    { id: 5, name: 'Salad', cost: 4.99, quantity: 1 },
  ];
  const calculate_total = () => {
    let total = 0
    foodItems.map((item) => (
      item.extra_cost ? total += (item.cost *item.quantity + item.extra_cost) : total += item.cost * item.quantity
      
    ))
    return total
  }

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
            <p style = {{fontSize: 30, fontWeight: '500'}}>${calculate_total()}</p>
        </div>
      </div>
      <div style = {{backgroundColor: '#E8E8E8', padding: '10px', borderWidth: 1, borderRadius: 25, marginRight: 10, marginLeft: 10}}>
      {foodItems.map((item) => (
        <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7.5px 20px'}}>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span 
                style={{
                  backgroundColor: 'white', 
                  color: 'black', 
                  padding: '3px 8px', 
                  borderRadius: '4px', 
                  marginRight: '10px',
                  fontSize: '14px',
                }}
              >
                {item.quantity}
              </span>
              <span>{item.name}</span>
            </span>
            {item.extra ? (
              <span style={{ fontSize: '12px', color: '#888', marginTop: '5px', marginLeft: 30, display: 'flex', alignItems: 'center' }}>
              <MdOutlineSubdirectoryArrowRight 
                style={{fontSize: '16px', marginTop: -5 }} 
              />
              <span style={{ marginRight: '3px' }}>{item.extra}</span>
              (${item.extra_cost})
            </span>
            ) : null}
          </span>
          <span>${item.cost * item.quantity}</span>
        </li>
      
      ))}
      </div>
      <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '50px'}}>
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
            navigate('/checkoutform'); // Navigate to Checkout page
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
        backgroundColor: 'white',
      }}>
        Pay securely with Stripe
      </p>
    </div>
  );
};

export default Checkout;
