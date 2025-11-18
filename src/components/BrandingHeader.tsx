import React from 'react';
import { QrCode } from 'lucide-react';

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
  // Default QuickPay icon (QR code style)
  const defaultIcon = (
    <div className="w-16 h-16 bg-primary-green rounded-xl flex items-center justify-center mx-auto">
      <QrCode size={40} color="white" />
    </div>
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

