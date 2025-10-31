// Session Storage Utilities

const SESSION_TOKEN_KEY = 'bill_session_token';

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
};

