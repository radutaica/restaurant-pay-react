import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import UnderConstruction from './pages/UnderConstruction';
import Checkout from './pages/Checkout'; // Import the Checkout page
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import CheckoutForm from './pages/CheckoutForm';

const stripePromise = loadStripe('pk_test_51Q4n7pKc7qc8vhebMAaJl8f41z4a1KSK3ofSeno1K2D62AH5DyWfzWSwkQgt0cbSg2GKG3G2tEeHns2Kg2OQVtJN00pfcNCBwe');

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    setIsMobile(/android|ipad|iphone|ipod/i.test(userAgent.toLowerCase()));
  }, []);

  return (
    <Elements stripe={stripePromise}>
    <Router>
      <Routes>
        {isMobile ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkoutform" element={<CheckoutForm />} />
          </>
        ) : (
          <Route path="/" element={<UnderConstruction />} />
        )}
      </Routes>
    </Router>
    </Elements>
  );
}

export default App;
