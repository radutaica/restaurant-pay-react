import React from 'react';

interface BrandingHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

const BrandingHeader: React.FC<BrandingHeaderProps> = ({
  title = 'Welcome to QuickPay',
  subtitle = 'Your digital payment solution',
  icon,
}) => {
  // Default QuickPay icon (green grid/QR code style)
  const defaultIcon = (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <rect width="64" height="64" rx="12" fill="#167445" />
      <rect x="12" y="12" width="12" height="12" fill="white" rx="2" />
      <rect x="28" y="12" width="12" height="12" fill="white" rx="2" />
      <rect x="44" y="12" width="8" height="12" fill="white" rx="2" />
      <rect x="12" y="28" width="12" height="12" fill="white" rx="2" />
      <rect x="28" y="28" width="12" height="12" fill="white" rx="2" />
      <rect x="44" y="28" width="8" height="12" fill="white" rx="2" />
      <rect x="12" y="44" width="12" height="8" fill="white" rx="2" />
      <rect x="28" y="44" width="12" height="8" fill="white" rx="2" />
      <rect x="44" y="44" width="8" height="8" fill="white" rx="2" />
    </svg>
  );

  return (
    <div className="text-center mb-8">
      <div className="mb-4 flex justify-center">
        {icon || defaultIcon}
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-2">
        {title}
      </h1>
      <p className="text-base md:text-lg text-text-light">
        {subtitle}
      </p>
    </div>
  );
};

export default BrandingHeader;

