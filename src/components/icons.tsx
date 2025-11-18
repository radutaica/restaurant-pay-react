import React from 'react';
import { Receipt, CreditCard, Mail } from 'lucide-react';

// Bill/Receipt Icon
export const BillIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Receipt className={className} size={24} color="#167445" />
);

// Credit Card Icon
export const CreditCardIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <CreditCard className={className} size={24} color="#167445" />
);

// Envelope/Mail Icon
export const EnvelopeIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Mail className={className} size={24} />
);

