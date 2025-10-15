import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { baseUrl } from './ReusableData';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import '../styles/CheckoutForm.css';

// Load your Stripe publishable key
const stripePromise = loadStripe('pk_test_51Q4n7pKc7qc8vhebMAaJl8f41z4a1KSK3ofSeno1K2D62AH5DyWfzWSwkQgt0cbSg2GKG3G2tEeHns2Kg2OQVtJN00pfcNCBwe');

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchPaymentIntent = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/users/payment/create_payment`,
        { amount: 4159 }, // example amount in cents ($41.59)
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      );
      setClientSecret(response.data.client_secret);
    } catch (error) {
      console.error('Error fetching payment intent:', error);
      setErrorMessage('Failed to initiate payment. Please try again.');
    }
  };

  useEffect(() => {
    fetchPaymentIntent();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return; // Stripe.js has not loaded yet

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkoutform`,
      },
    });

    if (error) {
      setErrorMessage(error.message || 'An error occurred during payment');
      setIsProcessing(false);
    } else {
      setErrorMessage('');
      alert('Payment successful! Thank you for dining with us.');
      setIsProcessing(false);
    }
  };

  return (
    clientSecret && (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <form onSubmit={handleSubmit} className="payment-form">
          <h2 className="form-title">Restaurant Checkout</h2>
          <p className="form-subtitle">Please complete your payment</p>

          {/* Email input */}
          <div className="form-group">
            <label htmlFor="email-input">Email</label>
            <input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              type="email"
              id="email-input"
              placeholder="example@example.com"
              required
            />
          </div>

          {/* PaymentElement */}
          <PaymentElement className="payment-element" />

          {/* Submit button */}
          <button
            type="submit"
            disabled={!stripe || !elements || isProcessing}
            className="submit-button"
          >
            {isProcessing ? 'Processing...' : 'Pay $41.59'}
          </button>

          {/* Error message */}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
        </form>
      </Elements>
    )
  );
};

export default CheckoutForm;
