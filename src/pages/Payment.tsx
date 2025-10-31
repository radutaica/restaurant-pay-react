import React, { useState, useEffect } from 'react';
import PaymentHeader from '../components/PaymentHeader';
import Card from '../components/Card';
import PaymentMethodButton from '../components/PaymentMethodButton';
import TipButton from '../components/TipButton';
import PrimaryButton from '../components/PrimaryButton';
import { ApplePayIcon, GooglePayIcon, CreditCardIcon } from '../components/paymentIcons';
import { BillSessionResponse } from '../api';

type PaymentMethod = 'apple' | 'google' | 'card';
type TipOption = 'none' | '5' | '10' | '15' | 'custom';

const Payment: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('google');
  const [tipOption, setTipOption] = useState<TipOption>('none');
  const [customTip, setCustomTip] = useState<string>('');
  const [subtotal, setSubtotal] = useState<number>(11700); // in cents
  const [tax, setTax] = useState<number>(2223); // in cents
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [total, setTotal] = useState<number>(13923); // in cents
  const [currency, setCurrency] = useState<string>('ron');

  // Load session data and calculate totals
  useEffect(() => {
    const storedSessionData = sessionStorage.getItem('bill_session_data');
    if (storedSessionData) {
      try {
        const sessionData: BillSessionResponse = JSON.parse(storedSessionData);
        setCurrency(sessionData.venue.currency);
        
        if (sessionData.bill) {
          setSubtotal(sessionData.bill.subtotal_cents);
          setTax(sessionData.bill.tax_cents);
          // Calculate total without tip first
          const baseTotal = sessionData.bill.total_cents;
          setTotal(baseTotal);
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
      }
    }
  }, []);

  // Calculate tip and total when tip option changes
  useEffect(() => {
    let tip = 0;
    
    if (tipOption === 'none') {
      tip = 0;
    } else if (tipOption === 'custom' && customTip) {
      tip = Math.round(parseFloat(customTip) * 100);
    } else if (tipOption !== 'custom') {
      const tipPercentage = parseFloat(tipOption) / 100;
      tip = Math.round(subtotal * tipPercentage);
    }
    
    setTipAmount(tip);
    setTotal(subtotal + tax + tip);
  }, [tipOption, customTip, subtotal, tax]);

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  };

  const handlePay = () => {
    // TODO: Implement payment processing
    console.log('Processing payment...', {
      paymentMethod,
      tipAmount,
      total,
    });
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-32">
        <div className="w-full max-w-lg mx-auto">
          <PaymentHeader />

          {/* Select Payment Method Card */}
          <Card title="Select payment method">
            <div className="space-y-3">
              <PaymentMethodButton
                icon={<ApplePayIcon />}
                label="Apple Pay"
                selected={paymentMethod === 'apple'}
                onClick={() => setPaymentMethod('apple')}
              />
              <PaymentMethodButton
                icon={<GooglePayIcon />}
                label="Google Pay"
                selected={paymentMethod === 'google'}
                onClick={() => setPaymentMethod('google')}
              />
              <PaymentMethodButton
                icon={<CreditCardIcon />}
                label="Credit/Debit Card"
                selected={paymentMethod === 'card'}
                onClick={() => setPaymentMethod('card')}
              />
            </div>
          </Card>

          {/* Add a Tip Card */}
          <Card title="Add a tip">
            <div className="space-y-4">
              {/* Tip Percentage Buttons */}
              <div className="flex gap-3">
                <TipButton
                  label="No tip"
                  selected={tipOption === 'none'}
                  onClick={() => {
                    setTipOption('none');
                    setCustomTip('');
                  }}
                />
                <TipButton
                  label="5%"
                  selected={tipOption === '5'}
                  onClick={() => {
                    setTipOption('5');
                    setCustomTip('');
                  }}
                />
                <TipButton
                  label="10%"
                  selected={tipOption === '10'}
                  onClick={() => {
                    setTipOption('10');
                    setCustomTip('');
                  }}
                />
                <TipButton
                  label="15%"
                  selected={tipOption === '15'}
                  onClick={() => {
                    setTipOption('15');
                    setCustomTip('');
                  }}
                />
              </div>

              {/* Custom Amount Input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Custom amount"
                  value={customTip}
                  onChange={(e) => {
                    setCustomTip(e.target.value);
                    if (e.target.value) {
                      setTipOption('custom');
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:border-primary-green text-text-dark"
                />
                <span className="text-text-light">{currency.toUpperCase()}</span>
              </div>
            </div>
          </Card>

          {/* Bill Summary */}
          <Card title="">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-light">Subtotal</span>
                <span className="text-text-dark font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-light">Tax (19%)</span>
                <span className="text-text-dark font-medium">{formatPrice(tax)}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-text-light">Tip</span>
                  <span className="text-text-dark font-medium">{formatPrice(tipAmount)}</span>
                </div>
              )}
              <div className="border-t-2 border-border-light pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-dark font-bold text-lg">Total</span>
                  <span className="text-text-dark font-bold text-lg">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Security Disclaimer */}
          <div className="flex items-center justify-center gap-2 text-text-light text-sm mb-6">
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
            <span>Payments are processed securely by Stripe.</span>
          </div>
        </div>
      </div>

      {/* Fixed Pay Button at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background-light border-t border-border-light px-4 py-4 shadow-lg z-10">
        <div className="w-full max-w-lg mx-auto">
          <PrimaryButton onClick={handlePay}>
            Pay {formatPrice(total)}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default Payment;

