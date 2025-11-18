// Bill Session Service

import { apiClient } from '../config/client';
import { API_ENDPOINTS } from '../config';
import { BillSessionResponse, UpdateTipRequest, UpdateTipResponse } from '../types/billSession';

export class BillSessionService {
  /**
   * Creates a bill session using QR token
   * GET /t/:slug?t=token
   */
  static async createSession(slug: string, token: string): Promise<BillSessionResponse> {
    try {
      const url = API_ENDPOINTS.BILL_SESSION.CREATE_SESSION(slug);
      const response = await apiClient.get<BillSessionResponse>(url, {
        params: { t: token },
      });
      return response;
    } catch (error) {
      console.error('Error creating bill session:', error);
      throw new Error('Failed to create bill session. Please try again.');
    }
  }

  /**
   * Updates the tip for a bill
   * PATCH /bills/update_tip
   */
  static async updateTip(tipCents: number): Promise<UpdateTipResponse> {
    try {
      const url = API_ENDPOINTS.BILL_SESSION.UPDATE_TIP;
      const requestData: UpdateTipRequest = { tip_cents: tipCents };
      const response = await apiClient.patch<UpdateTipResponse>(url, requestData);
      return response;
    } catch (error: any) {
      console.error('Error updating tip:', error);
      
      // Handle specific error responses
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.error || 'Invalid tip amount');
      } else if (error.response?.status === 422) {
        throw new Error(error.response.data?.error || 'Cannot update tip for closed bill');
      } else if (error.response?.status === 500) {
        throw new Error('Internal server error. Please try again.');
      }
      
      throw new Error('Failed to update tip. Please try again.');
    }
  }
}


