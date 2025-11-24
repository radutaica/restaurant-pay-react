import React, {useState, useEffect, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutHeader from '../components/CheckoutHeader';
import BillItem, { BillItemData } from '../components/BillItem';
import BillSummary from '../components/BillSummary';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import FooterDisclaimer from '../components/FooterDisclaimer';
import { sessionStorageUtils } from '../utils/sessionStorage';
import { ItemTableRelationsService } from '../api';
import { usePaymentUpdatesActionCable, PaymentUpdateData } from '../hooks/usePaymentUpdatesActionCable';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [billItems, setBillItems] = useState<BillItemData[]>([]);
  const [restaurantName, setRestaurantName] = useState<string>('Restaurant');
  const [tableName, setTableName] = useState<string>('Table');
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [paidCents, setPaidCents] = useState<number | undefined>(undefined);
  const [remainingCents, setRemainingCents] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState<string>('ron');
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [hasSessionToken, setHasSessionToken] = useState<boolean>(false);

  // Handle payment updates from ActionCable
  const handlePaymentUpdate = useCallback((data: PaymentUpdateData) => {
    if (data.type === 'payment_completed') {
      console.log('[Checkout] Payment completed, updating bill data:', data);
      
      // Update bill totals if provided in the update
      if (data.bill) {
        setSubtotal(data.bill.subtotal_cents || subtotal);
        setTax(data.bill.tax_cents || tax);
        setTotal(data.bill.total_cents || total);
        setPaidCents(data.bill.paid_cents);
        setRemainingCents(data.bill.remaining_cents);
      }
      
      // Optionally refresh bill items if needed
      // You could refetch items here if the bill structure changed
    }
  }, [subtotal, tax, total]);

  const handleActionCableError = useCallback((error: Event) => {
    console.error('[Checkout] ActionCable connection error:', error);
  }, []);

  // Subscribe to ActionCable updates - only when session token is available
  usePaymentUpdatesActionCable({
    onPaymentCompleted: handlePaymentUpdate,
    onError: handleActionCableError,
    enabled: hasSessionToken,
  });

  // Load session data and fetch bill items on mount
  useEffect(() => {
    // Check if session token is available for SSE subscription
    const sessionToken = sessionStorageUtils.getSessionToken();
    setHasSessionToken(!!sessionToken);
    
    // Load session data from sessionStorage if available
    const sessionData = sessionStorageUtils.getFullSessionData();
    if (sessionData) {
      setRestaurantName(sessionData.venue.name);
      setTableName(sessionData.table.name);
      setCurrency(sessionData.venue.currency);

      // Use bill data directly from API response
      if (sessionData.bill) {
        setSubtotal(sessionData.bill.subtotal_cents);
        setTax(sessionData.bill.tax_cents);
        setTotal(sessionData.bill.total_cents);
        setPaidCents(sessionData.bill.paid_cents);
        setRemainingCents(sessionData.bill.remaining_cents);
      }

      // Fetch bill items from API
      const tableId = sessionStorageUtils.getTableId();
      if (tableId) {
        setIsLoadingItems(true);
        setItemsError(null);
        ItemTableRelationsService.getByTableId(tableId)
          .then((response) => {
            // Transform API response to BillItemData format
            // Group items by id to calculate quantities (if same item appears multiple times)
            const itemMap = new Map<number, { item: BillItemData; count: number }>();
            
            response.forEach((item) => {
              if (itemMap.has(item.id)) {
                // Increment quantity if item already exists
                const existing = itemMap.get(item.id)!;
                existing.count += 1;
              } else {
                // Add new item with quantity 1
                itemMap.set(item.id, {
                  item: {
                    id: item.id,
                    name: item.name,
                    quantity: 1,
                    price_cents: item.price_cents,
                    currency: sessionData.venue.currency,
                  },
                  count: 1,
                });
              }
            });
            
            // Convert map to array and set final quantities
            const transformedItems: BillItemData[] = Array.from(itemMap.values()).map(({ item, count }) => ({
              ...item,
              quantity: count,
            }));
            
            setBillItems(transformedItems);
            setIsLoadingItems(false);
          })
          .catch((error) => {
            console.error('Error fetching bill items:', error);
            setItemsError('Failed to load bill items. Please try again.');
            setIsLoadingItems(false);
          });
      }
    }
  }, []);

  const handlePayNow = () => {
    // Store payment details with kind 'full' for full bill payment
    const sessionData = sessionStorageUtils.getFullSessionData();
    if (sessionData?.bill) {
      // For full payment, requested_amount_cents is subtotal + tax (base amount before tip)
      const requestedAmount = sessionData.bill.subtotal_cents + sessionData.bill.tax_cents;
      sessionStorageUtils.setPaymentDetails('card', 0, sessionData.bill.total_cents, 'full', requestedAmount);
      // Clear any existing splitAmount from sessionStorage for full payment
      sessionStorage.removeItem('splitAmount_cents');
    }
    navigate('/payment');
  };

  const handleSplitBill = () => {
    navigate('/split-bill');
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-40">
        <div className="w-full max-w-lg mx-auto">
          <CheckoutHeader 
            restaurantName={restaurantName}
            tableName={tableName}
          />

          {/* Bill Details Card */}
          <div className="bg-background-white rounded-lg shadow-card p-6 mb-6">
            {isLoadingItems ? (
              <div className="text-center py-8">
                <p className="text-text-light">Loading bill items...</p>
              </div>
            ) : itemsError ? (
              <div className="text-center py-8">
                <p className="text-red-500">{itemsError}</p>
              </div>
            ) : billItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-light">No items found</p>
              </div>
            ) : (
              <>
                <div className="space-y-0">
                  {billItems.map((item) => (
                    <BillItem key={item.id} item={item} />
                  ))}
                </div>

                {/* Summary Section */}
                <BillSummary
                  subtotal_cents={subtotal}
                  tax_cents={tax}
                  total_cents={total}
                  paid_cents={paidCents}
                  remaining_cents={remainingCents}
                  currency={currency}
                />
              </>
            )}
          </div>

        </div>
      </div>

      {/* Fixed Action Buttons at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background-light border-t border-border-light px-4 py-4 shadow-lg z-10">
        <div className="w-full max-w-lg mx-auto space-y-3">
          <PrimaryButton onClick={handlePayNow}>
            Pay now
          </PrimaryButton>
          <SecondaryButton onClick={handleSplitBill}>
            Split bill
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
