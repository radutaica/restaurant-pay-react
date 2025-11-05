import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutHeader from '../components/CheckoutHeader';
import BillItem, { BillItemData } from '../components/BillItem';
import BillSummary from '../components/BillSummary';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import FooterDisclaimer from '../components/FooterDisclaimer';
import { sessionStorageUtils } from '../utils/sessionStorage';
import { ItemTableRelationsService } from '../api';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [billItems, setBillItems] = useState<BillItemData[]>([]);
  const [restaurantName, setRestaurantName] = useState<string>('Restaurant');
  const [tableName, setTableName] = useState<string>('Table');
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('ron');
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  // Load session data and fetch bill items on mount
  useEffect(() => {
    // Load session data from sessionStorage if available
    const sessionData = sessionStorageUtils.getFullSessionData();
    if (sessionData) {
      setRestaurantName(sessionData.venue.name);
      setTableName(sessionData.table.name);
      setCurrency(sessionData.venue.currency);

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
            
            // Fallback to session bill data if API fails
            if (sessionData.bill) {
              setSubtotal(sessionData.bill.subtotal_cents);
              setTax(sessionData.bill.tax_cents);
              setTotal(sessionData.bill.total_cents);
            }
          });
      } else if (sessionData.bill) {
        // Fallback: use session bill data if no tableId
        setSubtotal(sessionData.bill.subtotal_cents);
        setTax(sessionData.bill.tax_cents);
        setTotal(sessionData.bill.total_cents);
      }
    }
  }, []);

  // Calculate subtotal, tax, and total from bill items
  useEffect(() => {
    if (billItems.length > 0) {
      // Calculate subtotal: sum of (price * quantity) for each item
      const subtotalCents = billItems.reduce((sum, item) => {
        return sum + (item.price_cents * item.quantity);
      }, 0);
      
      // Tax calculation (19% VAT - common in Romania)
      const taxCents = Math.round(subtotalCents * 0.19);
      
      // Total = subtotal + tax
      const totalCents = subtotalCents + taxCents;

      setSubtotal(subtotalCents);
      setTax(taxCents);
      setTotal(totalCents);
    }
  }, [billItems]);

  const handlePayNow = () => {
    navigate('/payment');
  };

  const handleSplitBill = () => {
    // TODO: Implement split bill functionality
    console.log('Split bill functionality to be implemented');
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
