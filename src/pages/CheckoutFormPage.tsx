import React, { useState, useEffect } from 'react';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import { PaymentService } from '../api';
import { sessionStorageUtils } from '../utils/sessionStorage';

// Load Stripe outside of component render to avoid recreating on each render
const stripePromise = loadStripe('pk_test_51Q4n7pKc7qc8vhebMAaJl8f41z4a1KSK3ofSeno1K2D62AH5DyWfzWSwkQgt0cbSg2GKG3G2tEeHns2Kg2OQVtJN00pfcNCBwe');

const CheckoutFormPage: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        // Get totals from session storage
        const calculatedTotals = sessionStorageUtils.getCalculatedTotals();
        const sessionData = sessionStorageUtils.getFullSessionData();
        const paymentDetails = sessionStorageUtils.getPaymentDetails();

        let finalTotal = 4550; // Default fallback
        let requestedAmount = 0;
        let tipAmount = 0;
        let kind: 'full' | 'equal_split' | 'custom' = 'full';

        // Get payment details if available
        if (paymentDetails) {
          finalTotal = paymentDetails.total_cents;
          tipAmount = paymentDetails.tipAmount_cents;
          kind = paymentDetails.kind || 'full';
          requestedAmount = paymentDetails.requested_amount_cents || (finalTotal - tipAmount);
        } else {
          // Fallback to calculated totals or bill data
          if (calculatedTotals) {
            finalTotal = calculatedTotals.total_cents;
            requestedAmount = calculatedTotals.subtotal_cents + calculatedTotals.tax_cents;
            tipAmount = calculatedTotals.total_cents - requestedAmount;
          } else if (sessionData?.bill) {
            finalTotal = sessionData.bill.total_cents;
            requestedAmount = sessionData.bill.subtotal_cents + sessionData.bill.tax_cents;
            tipAmount = sessionData.bill.tip_cents || 0;
          }
        }

        const response = await PaymentService.createPaymentIntent({ 
          amount: finalTotal,
          requested_amount_cents: requestedAmount,
          tip_cents: tipAmount,
          kind
        });
        setClientSecret(response.client_secret);
      } catch (error) {
        console.error('Error fetching payment intent:', error);
        setError('Failed to initiate payment. Please try again.');
      }
    };

    fetchPaymentIntent();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background-light flex justify-center items-center px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-green text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background-light flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green mx-auto mb-4"></div>
          <p className="text-text-light">Loading payment form...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutFormPage;
