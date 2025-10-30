// Bill Session Service

import { apiClient } from '../config/client';
import { API_ENDPOINTS } from '../config';

export type BillSessionResponse = Record<string, unknown>;

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
}


