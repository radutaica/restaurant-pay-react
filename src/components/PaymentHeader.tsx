import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-dark mb-4 hover:text-primary-green transition-colors"
      >
        <svg
          width="20"
          height="20"
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
        <span className="font-medium">Back</span>
      </button>
      <h1 className="text-3xl font-bold text-text-dark mb-2">Payment</h1>
      <p className="text-text-light">Complete your payment securely</p>
    </div>
  );
};

export default PaymentHeader;

