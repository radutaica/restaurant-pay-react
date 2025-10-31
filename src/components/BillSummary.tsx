import React from 'react';

interface BillSummaryProps {
  subtotal_cents: number;
  tax_cents: number;
  tax_percentage?: number;
  total_cents: number;
  currency?: string;
}

const BillSummary: React.FC<BillSummaryProps> = ({
  subtotal_cents,
  tax_cents,
  tax_percentage,
  total_cents,
  currency = 'ron',
}) => {
  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  };

  const calculateTaxPercentage = () => {
    if (tax_percentage !== undefined) return tax_percentage;
    if (subtotal_cents > 0) {
      return Math.round((tax_cents / subtotal_cents) * 100);
    }
    return 0;
  };

  return (
    <div className="mt-4 pt-4 border-t-2 border-border-light">
      <div className="flex justify-between items-center py-2">
        <span className="text-text-light">Subtotal</span>
        <span className="text-text-dark font-medium">{formatPrice(subtotal_cents)}</span>
      </div>
      <div className="flex justify-between items-center py-2">
        <span className="text-text-light">Tax ({calculateTaxPercentage()}%)</span>
        <span className="text-text-dark font-medium">{formatPrice(tax_cents)}</span>
      </div>
      <div className="flex justify-between items-center py-3 mt-2 border-t border-border-light">
        <span className="text-text-dark font-bold text-lg">Total</span>
        <span className="text-text-dark font-bold text-lg">{formatPrice(total_cents)}</span>
      </div>
    </div>
  );
};

export default BillSummary;

