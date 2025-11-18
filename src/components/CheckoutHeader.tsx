import React from 'react';

interface CheckoutHeaderProps {
  restaurantName: string;
  tableName: string;
}

const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
  restaurantName,
  tableName,
}) => {
  // Green circular icon with dollar sign on receipt
  const billIcon = (
    <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mb-4 mx-auto">
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Receipt/Bill outline */}
        <path
          d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2V8H20"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dollar sign */}
        <path
          d="M12 6V18"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 9C9 8.44772 9.44772 8 10 8H11C11.5523 8 12 8.44772 12 9C12 9.55228 11.5523 10 11 10H10C9.44772 10 9 10.4477 9 11C9 11.5523 9.44772 12 10 12H11C11.5523 12 12 12.4477 12 13C12 13.5523 11.5523 14 11 14H10C9.44772 14 9 14.4477 9 15"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  return (
    <div className="text-center mb-6">
      {billIcon}
      <h1 className="text-3xl font-bold text-text-dark mb-2">
        {restaurantName}
      </h1>
      <p className="text-lg text-text-light">{tableName}</p>
    </div>
  );
};

export default CheckoutHeader;

