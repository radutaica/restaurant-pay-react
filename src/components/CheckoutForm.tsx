import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { sessionStorageUtils } from '../utils/sessionStorage';
import { CreditCardIcon } from './icons';

const CheckoutForm: React.FC = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [billingAddress, setBillingAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [tip, setTip] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('usd');

  useEffect(() => {
    // Load session data and totals
    const sessionData = sessionStorageUtils.getFullSessionData();
    if (sessionData) {
      setCurrency(sessionData.venue.currency);
    }

    // Get payment details to determine if this is a split/custom payment
    const paymentDetails = sessionStorageUtils.getPaymentDetails();
    const kind = paymentDetails?.kind || 'full';

    // If this is a split or custom payment, use the requested amount
    if (kind === 'equal_split' || kind === 'custom') {
      // For split/custom payments, use requested_amount_cents as the base
      if (paymentDetails?.requested_amount_cents !== undefined) {
        const baseAmount = paymentDetails.requested_amount_cents;
        const tipAmount = paymentDetails.tipAmount_cents || 0;
        
        // Calculate subtotal and tax backwards from the total amount using the tax rate
        if (sessionData?.bill) {
          // Tax rate = tax_cents / subtotal_cents
          const taxRate = sessionData.bill.subtotal_cents > 0 
            ? sessionData.bill.tax_cents / sessionData.bill.subtotal_cents 
            : 0.19; // Default to 19% if subtotal is 0
          // Total = Subtotal + (Subtotal * TaxRate) = Subtotal * (1 + TaxRate)
          // Subtotal = Total / (1 + TaxRate)
          const calculatedSubtotal = Math.round(baseAmount / (1 + taxRate));
          const calculatedTax = baseAmount - calculatedSubtotal;
          setSubtotal(calculatedSubtotal);
          setTax(calculatedTax);
        } else {
          // Fallback: assume tax is 19% of subtotal
          const estimatedSubtotal = Math.round(baseAmount / 1.19);
          setSubtotal(estimatedSubtotal);
          setTax(baseAmount - estimatedSubtotal);
        }
        
        setTip(tipAmount);
        setTotal(baseAmount + tipAmount);
      }
    } else {
      // For full payments, use the full bill amount from paymentDetails or bill data
      if (paymentDetails) {
        // Use payment details if available (from Payment page)
        const requestedAmount = paymentDetails.requested_amount_cents || 0;
        const tipAmount = paymentDetails.tipAmount_cents || 0;
        const totalAmount = paymentDetails.total_cents || 0;
        
        // Get subtotal and tax from bill data or calculate from requested amount
        if (sessionData?.bill) {
          // If remaining_cents was used, calculate subtotal and tax from requested amount
          if (sessionData.bill.remaining_cents !== undefined && sessionData.bill.remaining_cents > 0 && requestedAmount === sessionData.bill.remaining_cents) {
            // Calculate subtotal and tax from remaining_cents using the tax rate
            const taxRate = sessionData.bill.subtotal_cents > 0 
              ? sessionData.bill.tax_cents / sessionData.bill.subtotal_cents 
              : 0.19;
            const calculatedSubtotal = Math.round(requestedAmount / (1 + taxRate));
            const calculatedTax = requestedAmount - calculatedSubtotal;
            setSubtotal(calculatedSubtotal);
            setTax(calculatedTax);
          } else {
            // Use original bill subtotal and tax
            setSubtotal(sessionData.bill.subtotal_cents);
            setTax(sessionData.bill.tax_cents);
          }
        } else if (requestedAmount > 0) {
          // Fallback: estimate subtotal and tax (assuming 19% tax)
          const estimatedSubtotal = Math.round(requestedAmount / 1.19);
          setSubtotal(estimatedSubtotal);
          setTax(requestedAmount - estimatedSubtotal);
        }
        
        setTip(tipAmount);
        setTotal(totalAmount);
      } else {
        // Fallback to calculated totals or bill data
        const calculatedTotals = sessionStorageUtils.getCalculatedTotals();
        if (calculatedTotals) {
          setSubtotal(calculatedTotals.subtotal_cents);
          setTax(calculatedTotals.tax_cents);
          // Calculate tip from total - subtotal - tax
          const calculatedTip = calculatedTotals.total_cents - calculatedTotals.subtotal_cents - calculatedTotals.tax_cents;
          setTip(calculatedTip > 0 ? calculatedTip : 0);
          setTotal(calculatedTotals.total_cents);
        } else if (sessionData?.bill) {
          // If remaining_cents exists, use it
          if (sessionData.bill.remaining_cents !== undefined && sessionData.bill.remaining_cents > 0) {
            const remainingAmount = sessionData.bill.remaining_cents;
            const taxRate = sessionData.bill.subtotal_cents > 0 
              ? sessionData.bill.tax_cents / sessionData.bill.subtotal_cents 
              : 0.19;
            const calculatedSubtotal = Math.round(remainingAmount / (1 + taxRate));
            const calculatedTax = remainingAmount - calculatedSubtotal;
            setSubtotal(calculatedSubtotal);
            setTax(calculatedTax);
            setTotal(remainingAmount);
          } else {
            setSubtotal(sessionData.bill.subtotal_cents);
            setTax(sessionData.bill.tax_cents);
            setTotal(sessionData.bill.total_cents);
          }
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-confirmation`,
        payment_method_data: {
          billing_details: {
            email: emailInput,
            address: {
              line1: billingAddress,
              city: city,
              postal_code: postalCode,
              country: country,
            },
          },
        },
      },
    });

    if (error) {
      setErrorMessage(error.message || 'An error occurred during payment');
      setIsProcessing(false);
    } else {
      // Payment successful - navigate to confirmation
      sessionStorageUtils.setPaymentDetails('card', tip, total);
      navigate('/payment-confirmation');
    }
  };

  const formatPrice = (cents: number) => {
    const symbol = currency.toUpperCase() === 'USD' ? '$' : '';
    const amount = (cents / 100).toFixed(2);
    return currency.toUpperCase() === 'USD' ? `${symbol}${amount}` : `${amount} ${currency.toUpperCase()}`;
  };

  return (
    <div className="min-h-screen bg-background-light">
      <div className="w-full max-w-lg mx-auto px-4 pt-8 pb-32">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-text-dark hover:text-primary-green transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-text-dark mb-2">Secure Checkout</h1>
          <p className="text-text-light">Complete your payment</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Order Summary Card */}
          <div className="bg-background-white rounded-lg shadow-card p-6 mb-6">
            <h2 className="text-lg font-bold text-text-dark mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-light">Subtotal</span>
                <span className="text-text-dark font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-light">Tax</span>
                <span className="text-text-dark font-medium">{formatPrice(tax)}</span>
              </div>
              {tip > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-text-light">Tip</span>
                  <span className="text-text-dark font-medium">{formatPrice(tip)}</span>
                </div>
              )}
              <div className="border-t border-border-light pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-dark font-bold text-lg">Total</span>
                  <span className="text-primary-green font-bold text-lg">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Information Card */}
          <div className="bg-background-white rounded-lg shadow-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCardIcon className="text-primary-green" />
              <h2 className="text-lg font-bold text-text-dark">Card Information</h2>
            </div>
            <div className="space-y-4">
              <PaymentElement 
                options={{
                  layout: 'tabs',
                }}
              />
            </div>
          </div>

          {/* Billing Information Card */}
          <div className="bg-background-white rounded-lg shadow-card p-6 mb-6">
            <h2 className="text-lg font-bold text-text-dark mb-4">Billing Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-background-light border-0 text-text-dark placeholder-text-lighter focus:outline-none focus:ring-2 focus:ring-primary-green"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <label htmlFor="billing-address" className="block text-sm font-medium text-text-dark mb-2">
                  Billing Address
                </label>
                <input
                  type="text"
                  id="billing-address"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-background-light border-0 text-text-dark placeholder-text-lighter focus:outline-none focus:ring-2 focus:ring-primary-green"
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-text-dark mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-background-light border-0 text-text-dark placeholder-text-lighter focus:outline-none focus:ring-2 focus:ring-primary-green"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label htmlFor="postal-code" className="block text-sm font-medium text-text-dark mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postal-code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-background-light border-0 text-text-dark placeholder-text-lighter focus:outline-none focus:ring-2 focus:ring-primary-green"
                    placeholder="10001"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-text-dark mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-background-light border-0 text-text-dark placeholder-text-lighter focus:outline-none focus:ring-2 focus:ring-primary-green"
                  placeholder="United States"
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="mb-6 text-red-500 text-center text-sm">{errorMessage}</div>
          )}

          {/* Pay Button */}
          <button
            type="submit"
            disabled={!stripe || !elements || isProcessing}
            className="w-full bg-primary-green hover:bg-primary-greenDark disabled:bg-text-lighter disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-4"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10M6 10H18M6 10V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V10M18 10H6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
          </button>

          {/* Security Message */}
          <div className="flex items-center justify-center gap-2 text-text-light text-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10M6 10H18M6 10V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V10M18 10H6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Secured by Stripe • Your payment information is encrypted</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
