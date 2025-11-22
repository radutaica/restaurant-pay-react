// Payment API Types

export interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents (total amount to charge)
  requested_amount_cents: number; // Requested amount in cents (base amount before tip)
  tip_cents: number; // Tip amount in cents
  kind: 'full' | 'equal_split' | 'custom'; // Payment kind: full bill, equal split, or custom amount
}

export interface CreatePaymentIntentResponse {
  client_secret: string;
  id: string;
  amount: number;
  currency: string;
  status: string;
  contribution_id: string;
}

export interface PaymentError {
  message: string;
  code?: string;
  type?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface SendReceiptRequest {
  contribution_id: string;
  email: string;
}

export interface SendReceiptResponse {
  message: string;
}

export interface SendReceiptError {
  error: string;
}
