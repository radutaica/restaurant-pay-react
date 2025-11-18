import React from 'react';

// Bill/Document Icon
export const BillIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z"
      stroke="#167445"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 3V8H18"
      stroke="#167445"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Credit Card Icon
export const CreditCardIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      stroke="#167445"
      strokeWidth="2"
    />
    <path
      d="M3 10H21"
      stroke="#167445"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 14H7.01"
      stroke="#167445"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M11 14H15"
      stroke="#167445"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Envelope/Mail Icon
export const EnvelopeIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 6L12 13L2 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

