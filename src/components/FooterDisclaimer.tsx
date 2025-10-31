import React from 'react';

interface FooterDisclaimerProps {
  text?: string;
}

const FooterDisclaimer: React.FC<FooterDisclaimerProps> = ({
  text = 'Payments processed securely by Stripe.',
}) => {
  return (
    <p className="text-xs text-text-light text-center mt-8 mb-4">
      {text}
    </p>
  );
};

export default FooterDisclaimer;

