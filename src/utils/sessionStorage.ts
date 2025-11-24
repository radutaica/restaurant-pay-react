// Session Storage Utilities

import { BillSessionResponse } from '../api/types/billSession';

const SESSION_TOKEN_KEY = 'bill_session_token';
const TABLE_ID_KEY = 'bill_table_id';
const BILL_ID_KEY = 'bill_id';
const VENUE_ID_KEY = 'venue_id';
const VENUE_SLUG_KEY = 'venue_slug';
const SESSION_EXPIRES_AT_KEY = 'session_expires_at';
const FULL_SESSION_DATA_KEY = 'bill_session_data';
const CALCULATED_SUBTOTAL_KEY = 'calculated_subtotal_cents';
const CALCULATED_TAX_KEY = 'calculated_tax_cents';
const CALCULATED_TOTAL_KEY = 'calculated_total_cents';
const PAYMENT_METHOD_KEY = 'payment_method';
const PAYMENT_TIP_AMOUNT_KEY = 'payment_tip_amount_cents';
const PAYMENT_TOTAL_KEY = 'payment_total_cents';
const PAYMENT_TIME_KEY = 'payment_time';
const PAYMENT_KIND_KEY = 'payment_kind';
const PAYMENT_REQUESTED_AMOUNT_KEY = 'payment_requested_amount_cents';
const PAYMENT_CONTRIBUTION_ID_KEY = 'payment_contribution_id';

export const sessionStorageUtils = {
  /**
   * Get the session token from sessionStorage
   * @returns The session token or null if not found
   */
  getSessionToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  },

  /**
   * Store the session token in sessionStorage
   * @param token - The session token to store
   */
  setSessionToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  },

  /**
   * Remove the session token from sessionStorage
   */
  removeSessionToken(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  },

  /**
   * Check if a session token exists
   * @returns true if session token exists, false otherwise
   */
  hasSessionToken(): boolean {
    return this.getSessionToken() !== null;
  },

  /**
   * Store session data from BillSessionResponse
   * Stores all key pieces needed for future API calls
   * @param sessionData - The full session response data
   */
  setSessionData(sessionData: BillSessionResponse): void {
    if (typeof window === 'undefined') return;
    
    // Store session token
    this.setSessionToken(sessionData.session_token);
    
    // Store table information
    sessionStorage.setItem(TABLE_ID_KEY, sessionData.table.id.toString());
    
    // Store bill information
    sessionStorage.setItem(BILL_ID_KEY, sessionData.bill.id.toString());
    
    // Store venue information
    sessionStorage.setItem(VENUE_ID_KEY, sessionData.venue.id.toString());
    sessionStorage.setItem(VENUE_SLUG_KEY, sessionData.venue.slug);
    
    // Store session expiration
    sessionStorage.setItem(SESSION_EXPIRES_AT_KEY, sessionData.session_info.expires_at);
    
    // Store full session data for backward compatibility
    sessionStorage.setItem(FULL_SESSION_DATA_KEY, JSON.stringify(sessionData));
  },

  /**
   * Get table ID from sessionStorage
   * @returns The table ID or null if not found
   */
  getTableId(): number | null {
    if (typeof window === 'undefined') return null;
    const id = sessionStorage.getItem(TABLE_ID_KEY);
    return id ? parseInt(id, 10) : null;
  },

  /**
   * Get bill ID from sessionStorage
   * @returns The bill ID or null if not found
   */
  getBillId(): number | null {
    if (typeof window === 'undefined') return null;
    const id = sessionStorage.getItem(BILL_ID_KEY);
    return id ? parseInt(id, 10) : null;
  },

  /**
   * Get venue ID from sessionStorage
   * @returns The venue ID or null if not found
   */
  getVenueId(): number | null {
    if (typeof window === 'undefined') return null;
    const id = sessionStorage.getItem(VENUE_ID_KEY);
    return id ? parseInt(id, 10) : null;
  },

  /**
   * Get venue slug from sessionStorage
   * @returns The venue slug or null if not found
   */
  getVenueSlug(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(VENUE_SLUG_KEY);
  },

  /**
   * Get session expiration timestamp from sessionStorage
   * @returns The expiration timestamp or null if not found
   */
  getSessionExpiresAt(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(SESSION_EXPIRES_AT_KEY);
  },

  /**
   * Check if the current session is still valid (not expired)
   * @returns true if session is valid, false if expired or not found
   */
  isSessionValid(): boolean {
    if (typeof window === 'undefined') return false;
    const expiresAt = this.getSessionExpiresAt();
    if (!expiresAt) return false;
    
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    return now < expirationDate;
  },

  /**
   * Get full session data from sessionStorage
   * @returns The full BillSessionResponse or null if not found
   */
  getFullSessionData(): BillSessionResponse | null {
    if (typeof window === 'undefined') return null;
    const data = sessionStorage.getItem(FULL_SESSION_DATA_KEY);
    if (!data) return null;
    
    try {
      return JSON.parse(data) as BillSessionResponse;
    } catch (error) {
      console.error('Error parsing session data:', error);
      return null;
    }
  },

  /**
   * Update bill data in sessionStorage when receiving updates from ActionCable/SSE
   * Merges new bill data with existing session data
   * @param billData - Updated bill data to merge
   */
  updateBillData(billData: Partial<BillSessionResponse['bill']>): void {
    if (typeof window === 'undefined') return;
    
    const existingSessionData = this.getFullSessionData();
    if (!existingSessionData || !existingSessionData.bill) {
      console.warn('Cannot update bill data: no existing session data found');
      return;
    }

    // Merge new bill data with existing bill data
    const updatedBill = {
      ...existingSessionData.bill,
      ...billData,
    };

    // Update the full session data with merged bill
    const updatedSessionData: BillSessionResponse = {
      ...existingSessionData,
      bill: updatedBill,
    };

    // Save updated session data back to sessionStorage
    sessionStorage.setItem(FULL_SESSION_DATA_KEY, JSON.stringify(updatedSessionData));

    // Also update individual bill fields if they exist
    if (billData.id !== undefined) {
      sessionStorage.setItem(BILL_ID_KEY, billData.id.toString());
    }

    console.log('[SessionStorage] Bill data updated:', {
      billId: updatedBill.id,
      paid_cents: updatedBill.paid_cents,
      remaining_cents: updatedBill.remaining_cents,
      total_cents: updatedBill.total_cents,
    });
  },

  /**
   * Store calculated bill totals from Checkout page
   * @param subtotal_cents - Subtotal in cents
   * @param tax_cents - Tax in cents
   * @param total_cents - Total in cents
   */
  setCalculatedTotals(subtotal_cents: number, tax_cents: number, total_cents: number): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(CALCULATED_SUBTOTAL_KEY, subtotal_cents.toString());
    sessionStorage.setItem(CALCULATED_TAX_KEY, tax_cents.toString());
    sessionStorage.setItem(CALCULATED_TOTAL_KEY, total_cents.toString());
  },

  /**
   * Get calculated bill totals from sessionStorage
   * @returns Object with subtotal, tax, and total in cents, or null if not found
   */
  getCalculatedTotals(): { subtotal_cents: number; tax_cents: number; total_cents: number } | null {
    if (typeof window === 'undefined') return null;
    const subtotal = sessionStorage.getItem(CALCULATED_SUBTOTAL_KEY);
    const tax = sessionStorage.getItem(CALCULATED_TAX_KEY);
    const total = sessionStorage.getItem(CALCULATED_TOTAL_KEY);
    
    if (subtotal && tax && total) {
      return {
        subtotal_cents: parseInt(subtotal, 10),
        tax_cents: parseInt(tax, 10),
        total_cents: parseInt(total, 10),
      };
    }
    return null;
  },

  /**
   * Store payment details after successful payment
   * @param paymentMethod - Payment method used (apple, google, card)
   * @param tipAmount_cents - Tip amount in cents
   * @param total_cents - Total amount paid in cents
   * @param kind - Payment kind ('full', 'equal_split', or 'custom')
   * @param requested_amount_cents - Requested amount in cents (base amount before tip)
   * @param contribution_id - Contribution ID returned by server
   */
  setPaymentDetails(
    paymentMethod: string, 
    tipAmount_cents: number, 
    total_cents: number, 
    kind?: 'full' | 'equal_split' | 'custom',
    requested_amount_cents?: number,
    contribution_id?: string
  ): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(PAYMENT_METHOD_KEY, paymentMethod);
    sessionStorage.setItem(PAYMENT_TIP_AMOUNT_KEY, tipAmount_cents.toString());
    sessionStorage.setItem(PAYMENT_TOTAL_KEY, total_cents.toString());
    sessionStorage.setItem(PAYMENT_TIME_KEY, new Date().toISOString());
    if (kind) {
      sessionStorage.setItem(PAYMENT_KIND_KEY, kind);
    }
    if (requested_amount_cents !== undefined) {
      sessionStorage.setItem(PAYMENT_REQUESTED_AMOUNT_KEY, requested_amount_cents.toString());
    }
    if (contribution_id) {
      sessionStorage.setItem(PAYMENT_CONTRIBUTION_ID_KEY, contribution_id);
    }
  },

  /**
   * Get payment details from sessionStorage
   * @returns Object with payment details or null if not found
   */
  getPaymentDetails(): { 
    paymentMethod: string; 
    tipAmount_cents: number; 
    total_cents: number; 
    paymentTime: string;
    kind?: 'full' | 'equal_split' | 'custom';
    requested_amount_cents?: number;
    contribution_id?: string;
  } | null {
    if (typeof window === 'undefined') return null;
    const paymentMethod = sessionStorage.getItem(PAYMENT_METHOD_KEY);
    const tipAmount = sessionStorage.getItem(PAYMENT_TIP_AMOUNT_KEY);
    const total = sessionStorage.getItem(PAYMENT_TOTAL_KEY);
    const paymentTime = sessionStorage.getItem(PAYMENT_TIME_KEY);
    const kind = sessionStorage.getItem(PAYMENT_KIND_KEY) as 'full' | 'equal_split' | 'custom' | null;
    const requestedAmount = sessionStorage.getItem(PAYMENT_REQUESTED_AMOUNT_KEY);
    const contributionId = sessionStorage.getItem(PAYMENT_CONTRIBUTION_ID_KEY);
    
    if (paymentMethod && tipAmount && total && paymentTime) {
      return {
        paymentMethod,
        tipAmount_cents: parseInt(tipAmount, 10),
        total_cents: parseInt(total, 10),
        paymentTime,
        kind: kind || undefined,
        requested_amount_cents: requestedAmount ? parseInt(requestedAmount, 10) : undefined,
        contribution_id: contributionId || undefined,
      };
    }
    return null;
  },

  /**
   * Store the latest contribution ID associated with the current payment intent
   */
  setContributionId(contributionId: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(PAYMENT_CONTRIBUTION_ID_KEY, contributionId);
  },

  /**
   * Retrieve the stored contribution ID
   */
  getContributionId(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(PAYMENT_CONTRIBUTION_ID_KEY);
  },

  /**
   * Clear all session data from sessionStorage
   */
  clearSessionData(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(TABLE_ID_KEY);
    sessionStorage.removeItem(BILL_ID_KEY);
    sessionStorage.removeItem(VENUE_ID_KEY);
    sessionStorage.removeItem(VENUE_SLUG_KEY);
    sessionStorage.removeItem(SESSION_EXPIRES_AT_KEY);
    sessionStorage.removeItem(FULL_SESSION_DATA_KEY);
    sessionStorage.removeItem(CALCULATED_SUBTOTAL_KEY);
    sessionStorage.removeItem(CALCULATED_TAX_KEY);
    sessionStorage.removeItem(CALCULATED_TOTAL_KEY);
    sessionStorage.removeItem(PAYMENT_METHOD_KEY);
    sessionStorage.removeItem(PAYMENT_TIP_AMOUNT_KEY);
    sessionStorage.removeItem(PAYMENT_TOTAL_KEY);
    sessionStorage.removeItem(PAYMENT_TIME_KEY);
    sessionStorage.removeItem(PAYMENT_KIND_KEY);
    sessionStorage.removeItem(PAYMENT_REQUESTED_AMOUNT_KEY);
    sessionStorage.removeItem(PAYMENT_CONTRIBUTION_ID_KEY);
  },

  /**
   * Get the stored user email from localStorage (global across all venues)
   * @returns The stored email or null if not found
   */
  getStoredEmail(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('rp_user_email');
  },

  /**
   * Store the user email in localStorage (global across all venues)
   * @param email - The email address to store
   */
  setStoredEmail(email: string): void {
    if (typeof window === 'undefined' || !email) return;
    localStorage.setItem('rp_user_email', email.trim());
  },

  /**
   * Remove the stored user email from localStorage
   */
  removeStoredEmail(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('rp_user_email');
  },
};

