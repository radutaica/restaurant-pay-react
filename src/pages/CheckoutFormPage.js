import React from 'react';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';

// Load Stripe outside of component render to avoid recreating on each render
const stripePromise = loadStripe('pk_test_51Q4n7pKc7qc8vhebMAaJl8f41z4a1KSK3ofSeno1K2D62AH5DyWfzWSwkQgt0cbSg2GKG3G2tEeHns2Kg2OQVtJN00pfcNCBwe');

const CheckoutFormPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutFormPage;
