// Payment API Types

export interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents
}

export interface CreatePaymentIntentResponse {
  client_secret: string;
  id: string;
  amount: number;
  currency: string;
  status: string;
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
