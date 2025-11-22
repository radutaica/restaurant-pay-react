// Payment Service

import { apiClient } from '../config/client';
import { API_ENDPOINTS } from '../config';
import {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  PaymentError,
  SendReceiptRequest,
  SendReceiptResponse,
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

  /**
   * Sends receipt email to the user
   * @param request - Send receipt request with contribution_id and email
   * @returns Promise with send receipt response
   */
  static async sendReceipt(
    request: SendReceiptRequest
  ): Promise<SendReceiptResponse> {
    try {
      const response = await apiClient.post<SendReceiptResponse>(
        API_ENDPOINTS.PAYMENT.SEND_RECEIPT,
        request
      );
      return response;
    } catch (error: any) {
      console.error('Error sending receipt:', error);
      
      // Handle specific error responses
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.error || 'Email is required');
      } else if (error.response?.status === 404) {
        throw new Error('Contribution not found');
      } else if (error.response?.status === 422) {
        throw new Error(error.response.data?.error || 'Invalid request data');
      } else if (error.response?.status === 500) {
        throw new Error('An error occurred while sending receipt');
      }
      
      throw new Error('Failed to send receipt. Please try again.');
    }
  }
}
