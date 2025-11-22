import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { EnvelopeIcon } from '../components/icons';
import { sessionStorageUtils } from '../utils/sessionStorage';
import { PaymentService } from '../api';

const PaymentConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentMethod: string;
    tipAmount_cents: number;
    total_cents: number;
    paymentTime: string;
    contribution_id?: string;
  } | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('Restaurant');
  const [tableName, setTableName] = useState<string>('Table');
  const [currency, setCurrency] = useState<string>('ron');
  const [isSendingReceipt, setIsSendingReceipt] = useState<boolean>(false);
  const [receiptError, setReceiptError] = useState<string>('');
  const [receiptSuccess, setReceiptSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Load payment details
    const paymentData = sessionStorageUtils.getPaymentDetails();
    if (paymentData) {
      setPaymentDetails(paymentData);
    }

    // Load session data for restaurant/table info
    const sessionData = sessionStorageUtils.getFullSessionData();
    if (sessionData) {
      setRestaurantName(sessionData.venue.name);
      setTableName(sessionData.table.name);
      setCurrency(sessionData.venue.currency);
    }
  }, []);

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  };

  const formatPaymentMethod = (method: string) => {
    const methodMap: { [key: string]: string } = {
      apple: 'Apple Pay',
      google: 'Google Pay',
      card: 'Credit/Debit Card',
    };
    return methodMap[method] || method;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleShowToWaiter = () => {
    // TODO: Implement show to waiter functionality
    console.log('Show to waiter');
  };

  const handleEmailReceipt = async () => {
    if (!paymentDetails?.contribution_id) {
      setReceiptError('Contribution ID not found');
      return;
    }

    // Get email from localStorage (stored email)
    const storedEmail = sessionStorageUtils.getStoredEmail();
    if (!storedEmail) {
      setReceiptError('Please provide your email address');
      return;
    }

    setIsSendingReceipt(true);
    setReceiptError('');
    setReceiptSuccess(false);

    try {
      await PaymentService.sendReceipt({
        contribution_id: paymentDetails.contribution_id,
        email: storedEmail,
      });
      setReceiptSuccess(true);
      setReceiptError('');
    } catch (error: any) {
      setReceiptError(error.message || 'Failed to send receipt. Please try again.');
      setReceiptSuccess(false);
    } finally {
      setIsSendingReceipt(false);
    }
  };

  const handleBackToBill = () => {
    navigate('/checkout');
  };

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text-light">No payment details found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-32">
        <div className="w-full max-w-lg mx-auto">
          {/* Success Indicator */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary-green flex items-center justify-center mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-text-dark mb-2">
              Payment Successful!
            </h1>
            <p className="text-text-light text-base">
              Your transaction has been completed
            </p>
          </div>

          {/* Payment Details Card */}
          <div className="bg-background-white rounded-lg shadow-card p-6 mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-light">Amount paid</span>
                <span className="text-text-dark font-bold text-lg">
                  {formatPrice(paymentDetails.total_cents)}
                </span>
              </div>
              {paymentDetails.tipAmount_cents > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-text-light">Including tip</span>
                  <span className="text-primary-green font-bold">
                    +{formatPrice(paymentDetails.tipAmount_cents)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-text-light">Payment method</span>
                <span className="text-text-dark font-bold">
                  {formatPaymentMethod(paymentDetails.paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-light">Time</span>
                <span className="text-text-dark font-bold">
                  {formatTime(paymentDetails.paymentTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Restaurant/Table Information Card */}
          <div className="bg-background-white rounded-lg shadow-card p-6 mb-6">
            <div className="text-center">
              <h3 className="text-text-dark font-bold text-lg mb-1">
                {restaurantName}
              </h3>
              <p className="text-text-light">{tableName}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            {/* <PrimaryButton onClick={handleShowToWaiter}>
              Show to waiter
            </PrimaryButton> */}
            <PrimaryButton 
              onClick={handleEmailReceipt}
              disabled={isSendingReceipt || !paymentDetails?.contribution_id}
            >
              <div className="flex items-center justify-center gap-2">
                <EnvelopeIcon className="text-text-white" />
                <span>{isSendingReceipt ? 'Sending...' : 'Email receipt'}</span>
              </div>
            </PrimaryButton>
            
            {/* Receipt Status Messages */}
            {receiptSuccess && (
              <div className="text-center text-sm text-primary-green">
                Receipt email has been sent successfully!
              </div>
            )}
            {receiptError && (
              <div className="text-center text-sm text-red-500">
                {receiptError}
              </div>
            )}
          </div>

          {/* Back to bill link */}
          <div className="text-center">
            <button
              onClick={handleBackToBill}
              className="text-text-light hover:text-text-dark transition-colors text-sm"
            >
              Back to bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;

