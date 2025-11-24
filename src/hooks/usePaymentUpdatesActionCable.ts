import { useEffect, useRef, useCallback, useState } from 'react';
import { createConsumer, Subscription } from '@rails/actioncable';
import { API_CONFIG } from '../api/config';
import { sessionStorageUtils } from '../utils/sessionStorage';
import { Bill } from '../api/types/billSession';

export interface PaymentUpdateData {
  type: 'payment_completed' | 'heartbeat' | 'error' | 'connected';
  contribution?: any;
  bill?: any;
  message?: string;
  bill_id?: number;
}

export interface UsePaymentUpdatesOptions {
  onPaymentCompleted?: (data: PaymentUpdateData) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

/**
 * Custom hook to subscribe to payment updates via ActionCable
 * 
 * @param options - Configuration options for the ActionCable connection
 * @returns Object with connection status and manual control methods
 */
export const usePaymentUpdatesActionCable = (options: UsePaymentUpdatesOptions = {}) => {
  const { onPaymentCompleted, onError, enabled = true } = options;
  const consumerRef = useRef<any>(null);
  const subscriptionRef = useRef<Subscription | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const billIdRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    // Don't connect if disabled or already connected
    if (!enabled || consumerRef.current) {
      return;
    }

    const sessionToken = sessionStorageUtils.getSessionToken();
    if (!sessionToken) {
      console.warn('[ActionCable] No session token available for connection');
      return;
    }

    // Get bill ID from session storage
    const billId = sessionStorageUtils.getBillId();
    if (!billId) {
      console.warn('[ActionCable] No bill ID available for connection');
      return;
    }

    billIdRef.current = billId;

    // Build ActionCable URL
    // Convert https to wss for WebSocket connection
    const wsUrl = API_CONFIG.BASE_URL.replace(/^http/, 'ws').replace(/^https/, 'wss');
    const cableUrl = `${wsUrl}/cable?token=${encodeURIComponent(sessionToken)}`;
    
    console.log('[ActionCable] Connecting to:', cableUrl);
    console.log('[ActionCable] Subscribing to bill:', billId);

    try {
      // Create ActionCable consumer
      const consumer = createConsumer(cableUrl);
      consumerRef.current = consumer;

      // Subscribe to PaymentUpdatesChannel
      const subscription = consumer.subscriptions.create(
        {
          channel: 'PaymentUpdatesChannel',
          bill_id: billId,
        },
        {
          connected() {
            console.log('[ActionCable] Connected successfully', {
              billId: billId,
              timestamp: new Date().toISOString(),
            });
            setIsConnected(true);
          },

          disconnected() {
            console.log('[ActionCable] Disconnected', {
              billId: billId,
              timestamp: new Date().toISOString(),
            });
            setIsConnected(false);
            
            if (onError) {
              onError(new Event('disconnected'));
            }
          },

          received(data: PaymentUpdateData) {
            // Log raw data
            console.log('[ActionCable] Raw data received:', data);
            
            // Log parsed message with full details
            console.log('[ActionCable] Parsed message:', {
              type: data.type,
              timestamp: new Date().toISOString(),
              fullData: data,
            });

            // Handle different message types
            if (data.type === 'payment_completed') {
              console.log('[ActionCable] Payment completed event:', {
                contribution: data.contribution,
                bill: data.bill,
                billStatus: data.bill ? {
                  id: data.bill.id,
                  total_cents: data.bill.total_cents,
                  paid_cents: data.bill.paid_cents,
                  remaining_cents: data.bill.remaining_cents,
                } : null,
              });
              
              // Update bill data in sessionStorage if bill information is provided
              if (data.bill) {
                sessionStorageUtils.updateBillData(data.bill as Partial<Bill>);
              }
              
              if (onPaymentCompleted) {
                onPaymentCompleted(data);
              }
            } else if (data.type === 'heartbeat') {
              console.log('[ActionCable] Heartbeat received at', new Date().toISOString());
            } else if (data.type === 'connected') {
              console.log('[ActionCable] Connection confirmed for bill:', data.bill_id);
            } else if (data.type === 'error') {
              console.error('[ActionCable] Error message received:', {
                message: data.message,
                fullData: data,
              });
              
              if (onError) {
                onError(new Event('error'));
              }
            } else {
              // Unknown message type - but check if it contains bill data to update
              if (data.bill) {
                console.log('[ActionCable] Unknown message type with bill data, updating sessionStorage:', data.type);
                sessionStorageUtils.updateBillData(data.bill as Partial<Bill>);
              } else {
                console.log('[ActionCable] Unknown message type:', data.type, 'Full data:', data);
              }
            }
          },

          rejected() {
            console.error('[ActionCable] Subscription rejected', {
              billId: billId,
              timestamp: new Date().toISOString(),
            });
            setIsConnected(false);
            
            if (onError) {
              onError(new Event('rejected'));
            }
          },
        }
      );

      subscriptionRef.current = subscription;

    } catch (error) {
      console.error('[ActionCable] Error creating connection:', error);
      setIsConnected(false);
      
      if (onError) {
        onError(error as any);
      }
    }
  }, [enabled, onPaymentCompleted, onError]);

  const disconnect = useCallback(() => {
    console.log('[ActionCable] Disconnecting...');
    
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (consumerRef.current) {
      consumerRef.current.disconnect();
      consumerRef.current = null;
    }

    setIsConnected(false);
    billIdRef.current = null;
  }, []);

  // Connect when component mounts and session token is available
  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }

    // Small delay to ensure session token is available
    const timeoutId = setTimeout(() => {
      connect();
    }, 100);

    // Cleanup on unmount or when enabled changes
    return () => {
      clearTimeout(timeoutId);
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
  };
};

