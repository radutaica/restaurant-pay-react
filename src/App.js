import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import UnderConstruction from './pages/UnderConstruction';
import Checkout from './pages/Checkout'; // Import the Checkout page
import CheckoutFormPage from './pages/CheckoutFormPage';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    setIsMobile(/android|ipad|iphone|ipod/i.test(userAgent.toLowerCase()));
  }, []);

  return (
    <Router>
      <Routes>
        {isMobile ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkoutform" element={<CheckoutFormPage />} />
          </>
        ) : (
          <Route path="/" element={<UnderConstruction />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
