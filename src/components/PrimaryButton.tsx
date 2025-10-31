import React from 'react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full max-w-md mx-auto
        bg-primary-green
        hover:bg-primary-greenDark
        disabled:bg-text-lighter
        disabled:cursor-not-allowed
        text-white
        font-bold
        py-4
        px-6
        rounded-lg
        transition-colors
        duration-200
        shadow-md
        hover:shadow-lg
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;

