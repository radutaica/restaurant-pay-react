import React from 'react';
import { Receipt } from 'lucide-react';

interface CheckoutHeaderProps {
  restaurantName: string;
  tableName: string;
}

const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
  restaurantName,
  tableName,
}) => {
  // Green circular icon with receipt
  const billIcon = (
    <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mb-4 mx-auto">
      <Receipt size={36} color="white" />
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

