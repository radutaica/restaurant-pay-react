import React from 'react';

export interface BillItemData {
  id: number | string;
  name: string;
  quantity: number;
  price_cents: number;
  currency?: string;
}

interface BillItemProps {
  item: BillItemData;
}

const BillItem: React.FC<BillItemProps> = ({ item }) => {
  const formatPrice = (cents: number, currency: string = 'ron') => {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  };

  return (
    <div className="flex justify-between items-start py-3 border-b border-border-light last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-text-light text-sm">Qty: {item.quantity}</span>
          <span className="text-text-dark font-medium">{item.name}</span>
        </div>
      </div>
      <div className="text-text-dark font-medium ml-4">
        {formatPrice(item.price_cents * item.quantity, item.currency || 'ron')}
      </div>
    </div>
  );
};

export default BillItem;

