import React from 'react';

interface InfoCardProps {
  restaurantName: string;
  tableName: string;
  children?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({
  restaurantName,
  tableName,
  children,
}) => {
  return (
    <div className="bg-background-white rounded-lg shadow-card p-6 mb-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-text-dark text-center mb-2">
        {restaurantName}
      </h2>
      <p className="text-text-light text-center mb-4">{tableName}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
};

export default InfoCard;

