import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-background-white rounded-lg shadow-card p-6 mb-6 ${className}`}>
      <h3 className="text-lg font-bold text-text-dark mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default Card;

