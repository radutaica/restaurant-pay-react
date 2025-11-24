import { useEffect, useRef, useCallback, useState } from 'react';
import { API_CONFIG } from '../api/config';
import { sessionStorageUtils } from '../utils/sessionStorage';

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
 * Custom hook to subscribe to payment updates via Server-Sent Events (SSE)
 * Uses Fetch API with ReadableStream to support custom headers (bypass ngrok interstitial)
 * 
 * @param options - Configuration options for the SSE connection
 * @returns Object with connection status and manual control methods
 */
export const usePaymentUpdates = (options: UsePaymentUpdatesOptions = {}) => {
  const { onPaymentCompleted, onError, enabled = true } = options;
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const shouldReconnectRef = useRef<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const connect = useCallback(() => {
    // Don't connect if disabled, already connected, or should not reconnect
    if (!enabled || abortControllerRef.current || !shouldReconnectRef.current) {
      return;
    }

    const sessionToken = sessionStorageUtils.getSessionToken();
    if (!sessionToken) {
      console.warn('No session token available for SSE connection');
      shouldReconnectRef.current = false;
      return;
    }

    // Build SSE URL - token can be in query param or cookie
    const sseUrl = `${API_CONFIG.BASE_URL}/payment_updates/stream?token=${encodeURIComponent(sessionToken)}`;
    
    console.log('Connecting to SSE stream:', sseUrl);

    // Create abort controller for this connection
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    fetch(sseUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        // Bypass ngrok interstitial page - this is why we use Fetch instead of EventSource
        'ngrok-skip-browser-warning': 'true',
      },
      // Note: credentials removed to avoid CORS issues with wildcard Access-Control-Allow-Origin
      // Since we're passing token in query param, cookies aren't needed
      // If you need cookies, update server CORS to return exact origin instead of '*'
      // credentials: 'include',
      signal: abortController.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/event-stream')) {
          throw new Error(
            `Invalid content type: ${contentType}. Expected text/event-stream. ` +
            'Server may not be configured for SSE or is returning an error page.'
          );
        }

        if (!response.body) {
          throw new Error('ReadableStream not supported');
        }

        setIsConnected(true);
        console.log('[SSE] Connection opened successfully', {
          url: sseUrl,
          contentType: contentType,
          status: response.status,
          timestamp: new Date().toISOString(),
        });
        reconnectAttemptsRef.current = 0;
        shouldReconnectRef.current = true;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const readStream = () => {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                console.log('[SSE] Stream closed', {
                  timestamp: new Date().toISOString(),
                  reconnectAttempts: reconnectAttemptsRef.current,
                  shouldReconnect: shouldReconnectRef.current,
                });
                setIsConnected(false);
                abortControllerRef.current = null;

                // Attempt to reconnect if connection closed unexpectedly
                if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
                  reconnectAttemptsRef.current += 1;
                  console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
                  
                  reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                  }, reconnectDelay);
                } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                  console.error('Max reconnection attempts reached. SSE connection failed.');
                  shouldReconnectRef.current = false;
                  if (onError) {
                    onError(new Event('error'));
                  }
                }
                return;
              }

              // Decode chunk and add to buffer
              buffer += decoder.decode(value, { stream: true });

              // Process complete lines
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // Keep incomplete line in buffer

              for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Skip empty lines and comments
                if (!trimmedLine || trimmedLine.startsWith(':')) {
                  continue;
                }

                // Parse SSE data lines
                if (trimmedLine.startsWith('data: ')) {
                  const dataStr = trimmedLine.slice(6); // Remove 'data: ' prefix
                  
                  if (dataStr.trim()) {
                    // Log raw SSE data
                    console.log('[SSE] Raw data received:', dataStr);
                    
                    try {
                      const data: PaymentUpdateData = JSON.parse(dataStr);
                      
                      // Log parsed data with full details
                      console.log('[SSE] Parsed message:', {
                        type: data.type,
                        timestamp: new Date().toISOString(),
                        fullData: data,
                      });

                      // Handle different message types
                      if (data.type === 'payment_completed') {
                        console.log('[SSE] Payment completed event:', {
                          contribution: data.contribution,
                          bill: data.bill,
                          billStatus: data.bill ? {
                            id: data.bill.id,
                            total_cents: data.bill.total_cents,
                            paid_cents: data.bill.paid_cents,
                            remaining_cents: data.bill.remaining_cents,
                          } : null,
                        });
                        if (onPaymentCompleted) {
                          onPaymentCompleted(data);
                        }
                      } else if (data.type === 'heartbeat') {
                        // Heartbeat messages keep the connection alive
                        console.log('[SSE] Heartbeat received at', new Date().toISOString());
                      } else if (data.type === 'connected') {
                        console.log('[SSE] Connection confirmed for bill:', data.bill_id);
                      } else if (data.type === 'error') {
                        console.error('[SSE] Error message received:', {
                          message: data.message,
                          fullData: data,
                        });
                        if (onError) {
                          onError(new Event('error'));
                        }
                      } else {
                        // Unknown message type
                        console.log('[SSE] Unknown message type:', data.type, 'Full data:', data);
                      }
                    } catch (parseError) {
                      console.error('[SSE] Error parsing JSON:', {
                        error: parseError,
                        rawData: dataStr,
                        errorMessage: parseError instanceof Error ? parseError.message : String(parseError),
                      });
                    }
                  }
                } else if (trimmedLine.startsWith('event: ')) {
                  // Log event type if specified
                  const eventType = trimmedLine.slice(7);
                  console.log('[SSE] Event type:', eventType);
                } else if (trimmedLine.startsWith('id: ')) {
                  // Log event ID if specified
                  const eventId = trimmedLine.slice(4);
                  console.log('[SSE] Event ID:', eventId);
                }
              }

              // Continue reading
              readStream();
            })
            .catch((error) => {
              // Don't log abort errors (they're expected when disconnecting)
              if (error.name !== 'AbortError') {
                console.error('SSE read error:', error);
                setIsConnected(false);
                abortControllerRef.current = null;

                // Attempt to reconnect on errors
                if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
                  reconnectAttemptsRef.current += 1;
                  console.log(`Attempting to reconnect after error (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
                  
                  reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                  }, reconnectDelay);
                } else {
                  shouldReconnectRef.current = false;
                  if (onError) {
                    onError(error as any);
                  }
                }
              }
            });
        };

        readStream();
      })
      .catch((error) => {
        // Don't log abort errors
        if (error.name !== 'AbortError') {
          console.error('SSE connection error:', error);
          setIsConnected(false);
          abortControllerRef.current = null;

          // Attempt to reconnect
          if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectDelay);
          } else {
            shouldReconnectRef.current = false;
            if (onError) {
              onError(error as any);
            }
          }
        }
      });
  }, [enabled, onPaymentCompleted, onError, maxReconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false; // Stop reconnection attempts
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      console.log('Closing SSE connection');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsConnected(false);
    }

    reconnectAttemptsRef.current = 0;
  }, []);

  // Connect when component mounts and session token is available
  useEffect(() => {
    if (!enabled) {
      // Disconnect if disabled
      disconnect();
      return;
    }

    // Reset reconnection flag when enabled changes
    shouldReconnectRef.current = true;
    reconnectAttemptsRef.current = 0;

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

