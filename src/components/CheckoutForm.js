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

const CheckoutForm = () => {
  const [clientSecret, setClientSecret] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [paymentID, setPaymentID] = useState();

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const response = await axios.post(
          `${baseUrl}/users/payment/create_payment`,
          { amount: 10 },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
          }
        );
        if (response.status === 200) {
          setClientSecret(response.data.client_secret);
          setPaymentID(response.data.payment_id);
        }
      } catch (error) {
        console.error('Error fetching payment intent:', error);
        setErrorMessage('Failed to initiate payment');
      }
    };

    fetchPaymentIntent();
  }, []);

  return (
    clientSecret && (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutFormContent
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          emailInput={emailInput}
          setEmailInput={setEmailInput}
          paymentID={paymentID}
        />
      </Elements>
    )
  );
};

const CheckoutFormContent = ({ errorMessage, setErrorMessage, emailInput, setEmailInput, paymentID }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return; // Ensure Stripe is loaded

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'http://localhost:3001/',
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message);
      console.error("Payment confirmation error:", error);
    } else {
      console.log("IT WORKS")
    }
  };

  return (
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
  );
};

export default CheckoutForm;
