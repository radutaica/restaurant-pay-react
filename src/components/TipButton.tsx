import React from 'react';

interface TipButtonProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const TipButton: React.FC<TipButtonProps> = ({
  label,
  selected = false,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1
        px-4
        py-1.5
        rounded-lg
        border
        font-medium
        transition-colors
        duration-200
        ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-background-white text-text-light border-border-light'
            : selected
            ? 'bg-primary-green text-white border-primary-green'
            : 'bg-background-white text-text-dark border-border-light hover:border-primary-green'
        }
      `}
    >
      {label}
    </button>
  );
};

export default TipButton;

