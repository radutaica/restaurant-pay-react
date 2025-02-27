// src/pages/Home.js
import React, {useState} from 'react';
import '../styles/Checkout.css'; // Import CSS for styling
import topImage from '../assets/brunch.jpg'; // Import your top image
import logo from '../assets/demo_logo.png'; // Import your logo
import TopImage from '../components/TopImage';
import { MdOutlineSubdirectoryArrowRight } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import MainButton from '../components/MainButton';


const Checkout = () => {
  const navigate = useNavigate(); 
  const [isPressed, setIsPressed] = useState(false);
  const foodItems = [
    { id: 1, name: 'Burger', cost: 5.99, quantity: 1, extra: 'Add Bacon', extra_cost: 3.50 },
    { id: 2, name: 'Pizza', cost: 8.99, quantity: 2 },
    { id: 3, name: 'Sushi', cost: 12.50, quantity: 1 },
    { id: 4, name: 'Pasta', cost: 7.25, quantity: 3 },
    { id: 5, name: 'Salad', cost: 4.99, quantity: 1 },
    { id: 6, name: 'Burger', cost: 5.99, quantity: 1, extra: 'Add Bacon', extra_cost: 3.50 },
    { id: 7, name: 'Pizza', cost: 8.99, quantity: 2 },
    { id: 8, name: 'Sushi', cost: 12.50, quantity: 1 },
    { id: 9, name: 'Pasta', cost: 7.25, quantity: 3 },
    { id: 10, name: 'Salad', cost: 4.99, quantity: 1 },
    { id: 11, name: 'Burger', cost: 5.99, quantity: 1, extra: 'Add Bacon', extra_cost: 3.50 },
    { id: 12, name: 'Pizza', cost: 8.99, quantity: 2 },
    { id: 13, name: 'Sushi', cost: 12.50, quantity: 1 },
    { id: 14, name: 'Pasta', cost: 7.25, quantity: 3 },
    { id: 15, name: 'Salad', cost: 4.99, quantity: 1 },
  ];
  const calculate_total = () => {
    let total = 0
    foodItems.map((item) => (
      item.extra_cost ? total += (item.cost *item.quantity + item.extra_cost) : total += item.cost * item.quantity
      
    ))
    return total.toFixed(2)
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
        <div style={{
            backgroundColor: '#E8E8E8', 
            padding: '10px', 
            borderWidth: 1, 
            borderRadius: 25, 
            marginRight: 10, 
            marginLeft: 10,
            height: '300px',  // Fixed height for scrollable area
            overflowY: 'auto' // Enables vertical scrolling
          }}>
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
      </div>
      <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '50px'}}>
        <MainButton text = {'Pay the bill'} 
        onPress={() => {
          setIsPressed(!isPressed);
          navigate('/checkoutform'); // Navigate to Checkout page
        }}/>
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
        backgroundColor: 'transparent',
      }}>
        Pay securely with Stripe
      </p>
    </div>
  );
};

export default Checkout;
