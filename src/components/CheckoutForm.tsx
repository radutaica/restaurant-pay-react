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

  if (!clientSecret) {
    return (
      <div className="h-full flex justify-center items-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <div className="h-full flex justify-center items-center bg-gray-100">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-5 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Restaurant Checkout</h2>
          <p className="text-center text-base mb-6 text-gray-600">Please complete your payment</p>

          {/* Email input */}
          <div className="mb-4">
            <label htmlFor="email-input" className="text-sm text-gray-700 block mb-2">Email</label>
            <input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              type="email"
              id="email-input"
              placeholder="example@example.com"
              required
              className="w-full p-3 text-base border border-gray-300 rounded bg-gray-50 box-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* PaymentElement */}
          <div className="my-4">
            <PaymentElement />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!stripe || !elements || isProcessing}
            className="w-full p-3 bg-blue-600 text-white border-none rounded text-base cursor-pointer text-center transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            {isProcessing ? 'Processing...' : 'Pay $41.59'}
          </button>

          {/* Error message */}
          {errorMessage && <div className="mt-4 text-red-500 text-center text-sm">{errorMessage}</div>}
        </form>
      </div>
    </Elements>
  );
};

export default CheckoutForm;
