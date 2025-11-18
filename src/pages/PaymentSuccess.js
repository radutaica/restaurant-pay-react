import React from 'react';
import '../styles/Home.css'; // Import CSS for styling
import topImage from '../assets/brunch.jpg'; // Import your top image
import logo from '../assets/demo_logo.png'; // Import your logo
import TopImage from '../components/TopImage';
import { useNavigate } from 'react-router-dom';
import MainButton from '../components/MainButton';

const PaymentSuccess = () => {
  const navigate = useNavigate(); 

  return (
    <div className="home-container">
      {/* Top Image and Logo */}
      <TopImage 
        imageSrc={topImage}
        logoSrc={logo}
        logoSize={80}
      />

      {/* Payment Success Message */}
      <div className="content" style={{ textAlign: 'center', padding: '20px' }}>
        <h2 style={{ color: 'green', fontWeight: '600' }}>Payment Successful!</h2>
        <p style={{ fontSize: '18px', color: '#505050' }}>
          Thank you for your payment. Your transaction has been successfully processed.
        </p>
        <p style={{ fontSize: '16px', color: '#909090' }}>
          Table Ground Floor: <strong>34</strong>
        </p>
      </div>

      {/* Custom Button for Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30px' }}>
        <MainButton text="Return to Home" onPress={() => navigate('/')} />
      </div>

      {/* Payment Acknowledgment */}
      <p style={{
        display: 'flex', 
        alignItems: 'flex-end', 
        position: 'fixed', 
        bottom: 10, 
        left: 0,
        width: '100%', 
        justifyContent: 'center',
        padding: '10px',
        color: '#505050',
        backgroundColor: 'transparent'
      }}>
        Need help? Contact support at <a href="mailto:support@example.com">support@example.com</a>
      </p>
    </div>
  );
};

export default PaymentSuccess;
