import React from 'react';

interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
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
        bg-background-white
        hover:bg-background-offWhite
        disabled:bg-text-lighter
        disabled:cursor-not-allowed
        text-text-dark
        font-bold
        py-4
        px-6
        rounded-lg
        transition-colors
        duration-200
        shadow-md
        hover:shadow-lg
        border border-border-light
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;

