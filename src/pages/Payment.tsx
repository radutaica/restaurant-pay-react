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
  requestedAmount: number;
  kind: 'full' | 'equal_split' | 'custom';
  onSuccess: () => void;
  onError: (error: string) => void;
}> = ({ amount, currency, tipAmount, requestedAmount, kind, onSuccess, onError }) => {
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
        // Create payment intent via backend with requested_amount_cents, tip_cents, and kind
        const response = await PaymentService.createPaymentIntent({ 
          amount,
          requested_amount_cents: requestedAmount,
          tip_cents: tipAmount,
          kind
        });
        if (response.contribution_id) {
          sessionStorageUtils.setContributionId(response.contribution_id);
        }
        
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
          // Store payment details with tip, kind, and requested amount
          sessionStorageUtils.setPaymentDetails(
            'wallet',
            tipAmount,
            amount,
            kind,
            requestedAmount,
            response.contribution_id
          );
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
  }, [stripe, currency, requestedAmount, tipAmount, kind]);

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
  const [subtotal, setSubtotal] = useState<number>(); // in cents
  const [tax, setTax] = useState<number>(2223); // in cents
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [total, setTotal] = useState<number>(13923); // in cents
  const [currency, setCurrency] = useState<string>('ron');
  const [paymentError, setPaymentError] = useState<string>('');
  const [baseSplitAmount, setBaseSplitAmount] = useState<number | null>(null); // Store base split amount (without tip)
  const [paymentKind, setPaymentKind] = useState<'full' | 'equal_split' | 'custom'>('full');
  const [requestedAmount, setRequestedAmount] = useState<number>(0); // Requested amount before tip

  // Load session data and use bill totals from API
  useEffect(() => {
    const sessionData = sessionStorageUtils.getFullSessionData();
    const paymentDetails = sessionStorageUtils.getPaymentDetails();
    
    if (sessionData) {
      setCurrency(sessionData.venue.currency);
      
      // Load payment kind and requested amount from payment details if available
      // IMPORTANT: Check kind FIRST to determine if this is a split/custom payment
      const currentKind = paymentDetails?.kind || 'full';
      
      if (paymentDetails) {
        if (paymentDetails.kind) {
          setPaymentKind(paymentDetails.kind);
        }
        if (paymentDetails.requested_amount_cents !== undefined) {
          setRequestedAmount(paymentDetails.requested_amount_cents);
        }
      }
      
      // Only check for splitAmount if kind is 'equal_split' or 'custom'
      // If kind is 'full', ignore any splitAmount in sessionStorage
      const splitAmount = sessionStorage.getItem('splitAmount_cents');
      
      if ((currentKind === 'equal_split' || currentKind === 'custom') && splitAmount && sessionData.bill) {
        // Use the split amount as the base amount (without tip)
        const splitAmountCents = parseInt(splitAmount, 10);
        setBaseSplitAmount(splitAmountCents);
        setTotal(splitAmountCents);
        setRequestedAmount(splitAmountCents);
        // Calculate subtotal and tax backwards from the total amount using the tax rate
        // Tax rate = tax_cents / subtotal_cents
        const taxRate = sessionData.bill.subtotal_cents > 0 
          ? sessionData.bill.tax_cents / sessionData.bill.subtotal_cents 
          : 0.19; // Default to 19% if subtotal is 0
        // Total = Subtotal + (Subtotal * TaxRate) = Subtotal * (1 + TaxRate)
        // Subtotal = Total / (1 + TaxRate)
        const calculatedSubtotal = Math.round(splitAmountCents / (1 + taxRate));
        const calculatedTax = splitAmountCents - calculatedSubtotal;
        setSubtotal(calculatedSubtotal);
        setTax(calculatedTax);
      } else if (sessionData.bill) {
        // Use bill data directly from API response
        setBaseSplitAmount(null); // Not a split bill
        
        // If remaining_cents exists and is > 0, use it as the base amount instead of subtotal + tax
        if (sessionData.bill.remaining_cents !== undefined && sessionData.bill.remaining_cents > 0) {
          // Use remaining_cents as the base amount to pay
          const remainingAmount = sessionData.bill.remaining_cents;
          setTotal(remainingAmount);
          setRequestedAmount(remainingAmount);
          
          // Calculate subtotal and tax from remaining_cents using the tax rate
          const taxRate = sessionData.bill.subtotal_cents > 0 
            ? sessionData.bill.tax_cents / sessionData.bill.subtotal_cents 
            : 0.19; // Default to 19% if subtotal is 0
          const calculatedSubtotal = Math.round(remainingAmount / (1 + taxRate));
          const calculatedTax = remainingAmount - calculatedSubtotal;
          setSubtotal(calculatedSubtotal);
          setTax(calculatedTax);
        } else {
          // No remaining amount, use full bill totals
          setSubtotal(sessionData.bill.subtotal_cents);
          setTax(sessionData.bill.tax_cents);
          setTotal(sessionData.bill.total_cents);
          // For full bills, requested amount is subtotal + tax (without tip)
          const requestedAmountValue = sessionData.bill.subtotal_cents + sessionData.bill.tax_cents;
          setRequestedAmount(requestedAmountValue);
        }
        
        // If no kind is set from paymentDetails, default to 'full' for full bill payments
        if (!paymentDetails?.kind) {
          setPaymentKind('full');
        }
      }
    }
  }, []);

  // Calculate tip and total when tip option changes
  useEffect(() => {
    let tip = 0;
    
    // For split bills, calculate subtotal first to use for tip calculation
    let currentSubtotal = subtotal;
    if (baseSplitAmount !== null) {
      const sessionData = sessionStorageUtils.getFullSessionData();
      if (sessionData?.bill) {
        const taxRate = sessionData.bill.subtotal_cents > 0 
          ? sessionData.bill.tax_cents / sessionData.bill.subtotal_cents 
          : 0.19;
        currentSubtotal = Math.round(baseSplitAmount / (1 + taxRate));
      }
    } else {
      // For full payments, use the calculated subtotal (which may be from remaining_cents)
      currentSubtotal = subtotal;
    }
    
    if (tipOption === 'none') {
      tip = 0;
    } else if (tipOption === 'custom' && customTip) {
      tip = Math.round(parseFloat(customTip) * 100);
    } else if (tipOption !== 'custom') {
      const tipPercentage = parseFloat(tipOption) / 100;
      tip = Math.round(currentSubtotal * tipPercentage);
    }
    
    setTipAmount(tip);
    
    // For split bills, use baseSplitAmount + tip; otherwise use requestedAmount + tip
    if (baseSplitAmount !== null) {
      setTotal(baseSplitAmount + tip);
      // For split bills, recalculate subtotal and tax from baseSplitAmount
      const sessionData = sessionStorageUtils.getFullSessionData();
      if (sessionData?.bill) {
        const taxRate = sessionData.bill.subtotal_cents > 0 
          ? sessionData.bill.tax_cents / sessionData.bill.subtotal_cents 
          : 0.19;
        const calculatedSubtotal = Math.round(baseSplitAmount / (1 + taxRate));
        const calculatedTax = baseSplitAmount - calculatedSubtotal;
        setSubtotal(calculatedSubtotal);
        setTax(calculatedTax);
      }
    } else {
      // For full payments, use requestedAmount (which may be remaining_cents) + tip
      setTotal(requestedAmount + tip);
    }
  }, [tipOption, customTip, subtotal, tax, baseSplitAmount, requestedAmount]);


  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  };

  const handlePay = () => {
    if (paymentMethod === 'card') {
      // Calculate requested amount (base amount before tip)
      // For split bills, use baseSplitAmount; for full bills, use requestedAmount (which may be remaining_cents)
      const requestedAmountValue = baseSplitAmount !== null ? baseSplitAmount : requestedAmount;
      
      // Determine the correct kind: if it's not a split payment, ensure it's 'full'
      const finalKind = baseSplitAmount !== null ? paymentKind : (paymentKind || 'full');
      
      // Store payment details before navigating with kind and requested amount
      sessionStorageUtils.setPaymentDetails(paymentMethod, tipAmount, total, finalKind, requestedAmountValue);
      
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
                requestedAmount={requestedAmount}
                kind={paymentKind}
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

