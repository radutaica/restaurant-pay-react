import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UnderConstruction from './pages/UnderConstruction';
import Checkout from './pages/Checkout';
import CheckoutFormPage from './pages/CheckoutFormPage';
import Payment from './pages/Payment';
import PaymentConfirmation from './pages/PaymentConfirmation';
import SplitBill from './pages/SplitBill';

const App: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    setIsMobile(/android|ipad|iphone|ipod/i.test(userAgent.toLowerCase()));
  }, []);

  return (
    <Router>
      <Routes>
        {isMobile ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/t/:slug" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
            <Route path="/checkoutform" element={<CheckoutFormPage />} />
            <Route path="/split-bill" element={<SplitBill />} />
          </>
        ) : (
          <Route path="/" element={<UnderConstruction />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
