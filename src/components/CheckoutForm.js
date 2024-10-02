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

// Load your Stripe publishable key

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [clientSecret, setClientSecret] = useState(null); // State for clientSecret
  const stripePromise = loadStripe('pk_test_51Q4n7pKc7qc8vhebMAaJl8f41z4a1KSK3ofSeno1K2D62AH5DyWfzWSwkQgt0cbSg2GKG3G2tEeHns2Kg2OQVtJN00pfcNCBwe');

  useEffect(() => {
    // Fetch clientSecret from backend
    const fetchPaymentIntent = async () => {
      try {
        const response = await axios.post(
          `${baseUrl}/users/payment/create_payment`,
          { amount: 1000 }, // amount in cents (e.g., 1000 = $10)
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(response.data)
        setClientSecret(response.data.client_secret);
      } catch (error) {
        console.error('Error fetching payment intent:', error);
        setErrorMessage('Failed to initiate payment');
      }
    };

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
        <form onSubmit={handleSubmit} className="px-4">
          <div className="mb-3">
            <label htmlFor="email-input">Email</label>
            <div>
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                type="email"
                id="email-input"
                placeholder="johndoe@gmail.com"
              />
            </div>
          </div>
          {/* PaymentElement with inline styles */}
          <PaymentElement
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
              marginBottom: '20px', // Ensure some space below the PaymentElement
            }}
          />
          <button type="submit" disabled={!stripe || !elements}>
            Pay
          </button>
          {/* Show error message to your customers */}
          {errorMessage && <div>{errorMessage}</div>}
        </form>
      </Elements>
    )
  );
};

export default CheckoutForm;
