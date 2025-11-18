// Payment Service

import { apiClient } from '../config/client';
import { API_ENDPOINTS } from '../config';
import {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  PaymentError,
} from '../types/payment';

export class PaymentService {
  /**
   * Creates a payment intent for Stripe processing
   * @param request - Payment intent creation request
   * @returns Promise with payment intent response
   */
  static async createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResponse> {
    try {
      const response = await apiClient.post<CreatePaymentIntentResponse>(
        API_ENDPOINTS.PAYMENT.CREATE_INTENT,
        request
      );
      return response;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent. Please try again.');
    }
  }

  /**
   * Validates payment amount
   * @param amount - Amount in cents
   * @returns boolean indicating if amount is valid
   */
  static validateAmount(amount: number): boolean {
    return amount > 0 && Number.isInteger(amount);
  }

  /**
   * Formats amount for display
   * @param amount - Amount in cents
   * @returns Formatted amount string
   */
  static formatAmount(amount: number): string {
    return `$${(amount / 100).toFixed(2)}`;
  }
}
