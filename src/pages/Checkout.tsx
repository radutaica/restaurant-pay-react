import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutHeader from '../components/CheckoutHeader';
import BillItem, { BillItemData } from '../components/BillItem';
import BillSummary from '../components/BillSummary';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import FooterDisclaimer from '../components/FooterDisclaimer';
import { sessionStorageUtils } from '../utils/sessionStorage';

// Mock bill items - Replace with actual API call when endpoint is available
const mockBillItems: BillItemData[] = [
  { id: 1, name: 'Margherita Pizza', quantity: 2, price_cents: 2250, currency: 'ron' },
  { id: 2, name: 'Caesar Salad', quantity: 1, price_cents: 2800, currency: 'ron' },
  { id: 3, name: 'Tiramisu', quantity: 2, price_cents: 1600, currency: 'ron' },
  { id: 4, name: 'Mineral Water', quantity: 2, price_cents: 600, currency: 'ron' },
];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [billItems, setBillItems] = useState<BillItemData[]>(mockBillItems);
  const [restaurantName, setRestaurantName] = useState<string>('Restaurant');
  const [tableName, setTableName] = useState<string>('Table');
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('ron');
  const [sessionDataLoaded, setSessionDataLoaded] = useState<boolean>(false);

  // Load session data on mount
  useEffect(() => {
    // Load session data from sessionStorage if available
    const sessionData = sessionStorageUtils.getFullSessionData();
    if (sessionData) {
      setRestaurantName(sessionData.venue.name);
      setTableName(sessionData.table.name);
      setCurrency(sessionData.venue.currency);
      
      // Use bill data from session if available
      if (sessionData.bill) {
        setSubtotal(sessionData.bill.subtotal_cents);
        setTax(sessionData.bill.tax_cents);
        setTotal(sessionData.bill.total_cents);
        setSessionDataLoaded(true);
      }
    }
  }, []);

  // Calculate totals from bill items if not loaded from session
  useEffect(() => {
    if (!sessionDataLoaded) {
      const subtotalCents = billItems.reduce((sum, item) => sum + (item.price_cents * item.quantity), 0);
      // Tax calculation (19% VAT - common in Romania)
      const taxCents = Math.round(subtotalCents * 0.19);
      const totalCents = subtotalCents + taxCents;

      setSubtotal(subtotalCents);
      setTax(taxCents);
      setTotal(totalCents);
    }
    // TODO: Fetch actual bill items using session token from API
  }, [billItems, sessionDataLoaded]);

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
