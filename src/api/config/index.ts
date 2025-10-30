// API Configuration

export const API_CONFIG = {
  BASE_URL: 'https://b52b5eae9a95.ngrok-free.app',
  TIMEOUT: 10000, // 10 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    // Bypass ngrok browser interstitial which returns HTML instead of upstream response
    'ngrok-skip-browser-warning': '1',
  },
} as const;

export const API_ENDPOINTS = {
  PAYMENT: {
    CREATE_INTENT: '/users/payment/create_payment',
  },
  BILL_SESSION: {
    CREATE_SESSION: (slug: string) => `/t/${slug}`,
  },
} as const;
