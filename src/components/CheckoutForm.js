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
import '../styles/CheckoutForm.css'

// Load your Stripe publishable key
const stripePromise = loadStripe('pk_test_51Q4n7pKc7qc8vhebMAaJl8f41z4a1KSK3ofSeno1K2D62AH5DyWfzWSwkQgt0cbSg2GKG3G2tEeHns2Kg2OQVtJN00pfcNCBwe');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [errorMessage, setErrorMessage] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [clientSecret, setClientSecret] = useState(null);
  
  const fetchPaymentIntent = async () => {
    try {
      console.log("HEYYY")
      const response = await axios.post(
        `${baseUrl}/users/payment/create_payment`,
        { amount: 10 }, // example amount in cents (e.g., $41.59)
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
        }
      );
      setClientSecret(response.data.client_secret);
    } catch (error) {
      console.error('Error fetching payment intent:', error);
      setErrorMessage('Failed to initiate payment');
    }
  };

  useEffect(() => {
    console.log("USE EFFECT")
    fetchPaymentIntent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe.js has not loaded yet
    }

    const { error } = await stripe.confirmPayment({
      elements,
    });

    if (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    clientSecret && (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <form onSubmit={handleSubmit} className="payment-form">
          
          {/* Email input */}
          <div className="mb-3">
            <label htmlFor="email-input">Email</label>
            <div>
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                type="email"
                id="email-input"
                placeholder="johndoe@gmail.com"
                required
              />
            </div>
          </div>

          {/* PaymentElement */}
          <PaymentElement
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
              marginBottom: '20px', 
            }}
          />
          
          {/* Submit button */}
          <button type="submit" disabled={!stripe || !elements}>
            Pay $41.59
          </button>

          {/* Show error message */}
          {errorMessage && <div>{errorMessage}</div>}
        </form>
      </Elements>
    )
  );
};

export default CheckoutForm;
