import React from 'react';

interface PaymentMethodButtonProps {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  onClick: () => void;
}

const PaymentMethodButton: React.FC<PaymentMethodButtonProps> = ({
  icon,
  label,
  selected = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full
        flex
        items-center
        gap-3
        px-4
        py-4
        rounded-lg
        border
        transition-colors
        duration-200
        ${
          selected
            ? 'bg-primary-green text-white border-primary-green'
            : 'bg-background-white text-text-dark border-border-light hover:border-primary-green'
        }
      `}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default PaymentMethodButton;

