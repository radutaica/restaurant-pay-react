import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import PaymentHeader from '../components/PaymentHeader';
import Card from '../components/Card';
import PaymentMethodButton from '../components/PaymentMethodButton';
import TipButton from '../components/TipButton';
import PrimaryButton from '../components/PrimaryButton';
import { CreditCardIcon } from '../components/paymentIcons';
import { sessionStorageUtils } from '../utils/sessionStorage';
import { PaymentService, BillSessionService } from '../api';

// Load Stripe
const stripePromise = loadStripe('pk_test_51Q4n7pKc7qc8vhebMAaJl8f41z4a1KSK3ofSeno1K2D62AH5DyWfzWSwkQgt0cbSg2GKG3G2tEeHns2Kg2OQVtJN00pfcNCBwe');

type PaymentMethod = 'card';
type TipOption = 'none' | '5' | '10' | '15' | 'custom';

// Helper to convert currency to Stripe format
const getStripeCurrency = (currency: string): string => {
  const currencyMap: { [key: string]: string } = {
    'ron': 'ron',
    'usd': 'usd',
    'eur': 'eur',
  };
  return currencyMap[currency.toLowerCase()] || 'usd';
};

// Helper to get country from currency
const getCountryFromCurrency = (currency: string): string => {
  const currencyCountryMap: { [key: string]: string } = {
    'ron': 'RO',
    'usd': 'US',
    'eur': 'DE',
  };
  return currencyCountryMap[currency.toLowerCase()] || 'US';
};

// Payment Request Button Component for Apple Pay / Google Pay
const WalletPaymentButton: React.FC<{
  amount: number;
  currency: string;
  tipAmount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}> = ({ amount, currency, tipAmount, onSuccess, onError }) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize payment request
  useEffect(() => {
    if (!stripe) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const pr = stripe.paymentRequest({
      country: getCountryFromCurrency(currency),
      currency: getStripeCurrency(currency),
      total: {
        label: 'Total',
        amount: amount,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check if Apple Pay / Google Pay is available
    pr.canMakePayment().then((result: any) => {
      if (!isMounted) return;
      
      // Check specifically for Apple Pay or Google Pay (not just Link)
      const hasApplePay = result?.applePay === true;
      const hasGooglePay = result?.googlePay === true;
      
      if (result && (hasApplePay || hasGooglePay)) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
        console.log('Apple Pay/Google Pay available:', { hasApplePay, hasGooglePay });
      } else {
        setCanMakePayment(false);
        console.log('Apple Pay/Google Pay not available. Result:', result);
      }
      setIsLoading(false);
    }).catch((error) => {
      console.error('Error checking payment availability:', error);
      if (isMounted) {
        setCanMakePayment(false);
        setIsLoading(false);
      }
    });

    // Handle payment method selection
    pr.on('paymentmethod', async (ev: any) => {
      try {
        // Create payment intent via backend
        const response = await PaymentService.createPaymentIntent({ amount });
        
        // Confirm payment with Stripe
        const { error: confirmError } = await stripe.confirmCardPayment(
          response.client_secret,
          {
            payment_method: ev.paymentMethod.id,
          },
          { handleActions: false }
        );

        if (confirmError) {
          ev.complete('fail');
          onError(confirmError.message || 'Payment failed');
        } else {
          // Store payment details with tip
          sessionStorageUtils.setPaymentDetails('wallet', tipAmount, amount);
          ev.complete('success');
          onSuccess();
        }
      } catch (error: any) {
        ev.complete('fail');
        onError(error.message || 'Payment failed');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [stripe, currency]);

  // Update payment request amount when it changes
  useEffect(() => {
    if (paymentRequest) {
      paymentRequest.update({
        total: {
          label: 'Total',
          amount: amount,
        },
      });
    }
  }, [paymentRequest, amount]);

  if (isLoading) {
    return (
      <div className="mt-4 text-center text-text-light text-sm">
        Checking payment options...
      </div>
    );
  }

  // Don't show anything if payment is not available - the button won't render
  if (!canMakePayment || !paymentRequest) {
    return null;
  }

  return (
    <div className="w-full mt-4">
      {/* Stripe's official Payment Request Button - automatically shows Apple Pay on iOS or Google Pay on Android */}
      <div className="border border-border-light rounded-lg p-2 bg-background-white">
        <PaymentRequestButtonElement
          options={{
            paymentRequest,
            style: {
              paymentRequestButton: {
                theme: 'dark',
                height: '48px',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [tipOption, setTipOption] = useState<TipOption>('none');
  const [customTip, setCustomTip] = useState<string>('');
  const [subtotal, setSubtotal] = useState<number>(11700); // in cents
  const [tax, setTax] = useState<number>(2223); // in cents
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [total, setTotal] = useState<number>(13923); // in cents
  const [currency, setCurrency] = useState<string>('ron');
  const [paymentError, setPaymentError] = useState<string>('');
  const [tipUpdateLoading, setTipUpdateLoading] = useState<boolean>(false);
  const [tipUpdateError, setTipUpdateError] = useState<string>('');

  // Load session data and use bill totals from API
  useEffect(() => {
    const sessionData = sessionStorageUtils.getFullSessionData();
    if (sessionData) {
      setCurrency(sessionData.venue.currency);
      
      // Check if this is a split bill payment
      const splitAmount = sessionStorage.getItem('splitAmount_cents');
      
      if (splitAmount && sessionData.bill) {
        // Use the split amount as the total
        const splitAmountCents = parseInt(splitAmount, 10);
        setTotal(splitAmountCents);
        // For split bills, calculate proportional subtotal and tax based on split amount
        const splitRatio = splitAmountCents / sessionData.bill.total_cents;
        setSubtotal(Math.round(sessionData.bill.subtotal_cents * splitRatio));
        setTax(Math.round(sessionData.bill.tax_cents * splitRatio));
      } else if (sessionData.bill) {
        // Use bill data directly from API response
        setSubtotal(sessionData.bill.subtotal_cents);
        setTax(sessionData.bill.tax_cents);
        setTotal(sessionData.bill.total_cents);
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

  // Track if component has mounted to prevent API call on initial mount
  const isInitialMount = useRef<boolean>(true);
  const customTipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to update tip via API (memoized with useCallback)
  const updateTipViaAPI = useCallback(async (tipCents: number) => {
    setTipUpdateLoading(true);
    setTipUpdateError('');
    
    try {
      const response = await BillSessionService.updateTip(tipCents);
      
      // Update local state with API response
      if (response.bill) {
        // Update all bill-related state from API response
        setTipAmount(response.bill.tip_cents);
        setTotal(response.bill.total_cents);
        // Update subtotal and tax in case they changed (though they shouldn't)
        if (response.bill.subtotal_cents !== undefined) {
          setSubtotal(response.bill.subtotal_cents);
        }
        if (response.bill.tax_cents !== undefined) {
          setTax(response.bill.tax_cents);
        }
        
        // Update sessionStorage with updated bill data
        const sessionData = sessionStorageUtils.getFullSessionData();
        if (sessionData) {
          const updatedSessionData = {
            ...sessionData,
            bill: {
              ...sessionData.bill,
              ...response.bill,
            },
          };
          // Update the full session data in sessionStorage
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('bill_session_data', JSON.stringify(updatedSessionData));
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to update tip:', error);
      setTipUpdateError(error.message || 'Failed to update tip');
    } finally {
      setTipUpdateLoading(false);
    }
  }, []); // Empty deps - function doesn't depend on any props/state that change

  // Call API to update tip when predefined tip option is selected (excluding custom)
  useEffect(() => {
    // Skip on initial mount and custom tip option
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (tipOption === 'custom') {
      return;
    }

    // Calculate tip amount
    let tip = 0;
    if (tipOption === 'none') {
      tip = 0;
    } else {
      const tipPercentage = parseFloat(tipOption) / 100;
      tip = Math.round(subtotal * tipPercentage);
    }

    updateTipViaAPI(tip);
  }, [tipOption, subtotal, updateTipViaAPI]); // Include updateTipViaAPI in deps

  // Handle custom tip with debounce (300ms delay)
  useEffect(() => {
    // Clear previous timeout
    if (customTipTimeoutRef.current) {
      clearTimeout(customTipTimeoutRef.current);
    }

    // Skip if not custom option or if custom tip is empty
    if (tipOption !== 'custom' || !customTip) {
      return;
    }

    // Skip on initial mount
    if (isInitialMount.current) {
      return;
    }

    // Parse custom tip value
    const customTipValue = parseFloat(customTip);
    if (isNaN(customTipValue) || customTipValue < 0) {
      return;
    }

    // Convert to cents and debounce the API call
    const tipCents = Math.round(customTipValue * 100);
    
    customTipTimeoutRef.current = setTimeout(() => {
      updateTipViaAPI(tipCents);
    }, 300);

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (customTipTimeoutRef.current) {
        clearTimeout(customTipTimeoutRef.current);
      }
    };
  }, [customTip, tipOption, updateTipViaAPI]);

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  };

  const handlePay = () => {
    if (paymentMethod === 'card') {
      // Store payment details before navigating
      sessionStorageUtils.setPaymentDetails(paymentMethod, tipAmount, total);
      // Navigate to checkout form page
      navigate('/checkoutform');
    }
    // For Apple Pay / Google Pay, the WalletPaymentButton handles the payment
  };

  const handleWalletPaymentSuccess = () => {
    navigate('/payment-confirmation');
  };

  const handleWalletPaymentError = (error: string) => {
    setPaymentError(error);
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-background-light flex flex-col">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 pt-8 pb-32">
          <div className="w-full max-w-lg mx-auto">
            <PaymentHeader />

            {/* Select Payment Method Card */}
            <Card title="Select payment method">
              {/* Stripe Payment Request Button - automatically shows Apple Pay on iOS or Google Pay on Android when available */}
              <WalletPaymentButton
                amount={total}
                currency={currency}
                tipAmount={tipAmount}
                onSuccess={handleWalletPaymentSuccess}
                onError={handleWalletPaymentError}
              />
              
              <div className="mt-4 space-y-3">
                <PaymentMethodButton
                  icon={<CreditCardIcon />}
                  label="Credit/Debit Card"
                  selected={paymentMethod === 'card'}
                  onClick={() => {
                    setPaymentMethod('card');
                    setPaymentError('');
                  }}
                />
              </div>
              
              {/* Error message */}
              {paymentError && (
                <div className="mt-4 text-red-500 text-sm text-center">{paymentError}</div>
              )}
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
                    setTipUpdateError('');
                  }}
                  disabled={tipUpdateLoading}
                />
                <TipButton
                  label="5%"
                  selected={tipOption === '5'}
                  onClick={() => {
                    setTipOption('5');
                    setCustomTip('');
                    setTipUpdateError('');
                  }}
                  disabled={tipUpdateLoading}
                />
                <TipButton
                  label="10%"
                  selected={tipOption === '10'}
                  onClick={() => {
                    setTipOption('10');
                    setCustomTip('');
                    setTipUpdateError('');
                  }}
                  disabled={tipUpdateLoading}
                />
                <TipButton
                  label="15%"
                  selected={tipOption === '15'}
                  onClick={() => {
                    setTipOption('15');
                    setCustomTip('');
                    setTipUpdateError('');
                  }}
                  disabled={tipUpdateLoading}
                />
              </div>

              {/* Tip update loading indicator */}
              {tipUpdateLoading && (
                <div className="text-center text-text-light text-sm">
                  Updating tip...
                </div>
              )}

              {/* Tip update error message */}
              {tipUpdateError && (
                <div className="text-red-500 text-sm text-center">
                  {tipUpdateError}
                </div>
              )}

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
                    setTipUpdateError(''); // Clear error when user starts typing
                  }}
                  onBlur={() => {
                    // If user leaves the input and there's a valid value, update immediately
                    if (customTip && tipOption === 'custom') {
                      const customTipValue = parseFloat(customTip);
                      if (!isNaN(customTipValue) && customTipValue >= 0) {
                        // Clear any pending timeout and update immediately
                        if (customTipTimeoutRef.current) {
                          clearTimeout(customTipTimeoutRef.current);
                        }
                        const tipCents = Math.round(customTipValue * 100);
                        updateTipViaAPI(tipCents);
                      }
                    }
                  }}
                  disabled={tipUpdateLoading}
                  className="flex-1 px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:border-primary-green text-text-dark disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Fixed Pay Button at Bottom - Only show for card payments */}
        {paymentMethod === 'card' && (
          <div className="fixed bottom-0 left-0 right-0 bg-background-light border-t border-border-light px-4 py-4 shadow-lg z-10">
            <div className="w-full max-w-lg mx-auto">
              <PrimaryButton onClick={handlePay}>
                Pay {formatPrice(total)}
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </Elements>
  );
};

export default Payment;

