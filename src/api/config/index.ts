// API Configuration

export const API_CONFIG = {
  BASE_URL: 'https://58b111f28a94.ngrok-free.app',
  TIMEOUT: 10000, // 10 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
} as const;

export const API_ENDPOINTS = {
  PAYMENT: {
    CREATE_INTENT: '/users/payment/create_payment',
  },
} as const;
