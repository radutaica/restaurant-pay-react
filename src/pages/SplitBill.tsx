import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton';
import { sessionStorageUtils } from '../utils/sessionStorage';

type SplitMode = 'equal' | 'byItems' | 'custom';

const SplitBill: React.FC = () => {
  const navigate = useNavigate();
  const [total, setTotal] = useState<number>(0); // in cents
  const [currency, setCurrency] = useState<string>('ron');
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [numberOfPeople, setNumberOfPeople] = useState<number>(2);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [perPersonAmount, setPerPersonAmount] = useState<number>(0); // in cents
  const [remaining, setRemaining] = useState<number>(0); // in cents

  // Load session data and use bill totals from API
  useEffect(() => {
    const sessionData = sessionStorageUtils.getFullSessionData();
    
    if (sessionData) {
      setCurrency(sessionData.venue.currency);
      
      // Use bill data directly from API response
      if (sessionData.bill && sessionData.bill.total_cents > 0) {
        setTotal(sessionData.bill.total_cents);
        setRemaining(sessionData.bill.total_cents);
      }
    }
  }, []);

  // Calculate per person amount and remaining for equal split mode
  useEffect(() => {
    if (splitMode === 'equal' && numberOfPeople >= 2 && total > 0) {
      // Calculate per person amount (round to nearest cent)
      const perPerson = Math.round(total / numberOfPeople);
      setPerPersonAmount(perPerson);
      
      // Calculate remaining: total minus one person's share
      const remainingAmount = total - perPerson;
      setRemaining(Math.max(0, remainingAmount));
    } else if (splitMode === 'equal' && total === 0) {
      // Reset if total is 0
      setPerPersonAmount(0);
      setRemaining(0);
    }
  }, [splitMode, numberOfPeople, total]);

  // Reset custom amount when switching to custom mode
  useEffect(() => {
    if (splitMode === 'custom') {
      setCustomAmount('');
      setRemaining(total);
      setPerPersonAmount(0);
    } else if (splitMode === 'equal') {
      // When switching to equal, reset to default 2 people
      setNumberOfPeople(2);
    }
  }, [splitMode, total]);

  // Update remaining amount when custom amount changes in custom mode
  useEffect(() => {
    if (splitMode === 'custom') {
      if (total > 0) {
        if (customAmount && customAmount.trim() !== '' && !isNaN(parseFloat(customAmount)) && parseFloat(customAmount) > 0) {
          const amountCents = Math.round(parseFloat(customAmount) * 100);
          const remainingCents = Math.max(0, total - amountCents);
          setRemaining(remainingCents);
        } else {
          setRemaining(total);
        }
      } else {
        setRemaining(0);
      }
    }
  }, [customAmount, total, splitMode]);

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  };

  const handlePayMyPart = () => {
    let amountCents = 0;
    
    if (splitMode === 'equal') {
      amountCents = perPersonAmount;
    } else if (splitMode === 'custom' && customAmount) {
      amountCents = Math.round(parseFloat(customAmount) * 100);
    } else {
      return;
    }

    if (amountCents <= 0) {
      return;
    }
    
    // Store payment details with the split amount
    sessionStorageUtils.setPaymentDetails('card', 0, amountCents);
    
    // Store the split amount for later use
    sessionStorage.setItem('splitAmount_cents', amountCents.toString());
    
    // Navigate to payment page
    navigate('/payment');
  };

  const handleDecreasePeople = () => {
    if (numberOfPeople > 2) {
      setNumberOfPeople(numberOfPeople - 1);
    }
  };

  const handleIncreasePeople = () => {
    setNumberOfPeople(numberOfPeople + 1);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
    }
  };

  const isValidAmount = splitMode === 'equal' 
    ? (numberOfPeople >= 2 && perPersonAmount > 0)
    : (splitMode === 'custom' && customAmount && parseFloat(customAmount) > 0 && parseFloat(customAmount) <= total / 100);

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-32">
        <div className="w-full max-w-lg mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-text-dark mb-4 hover:text-primary-green transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12H5M5 12L12 19M5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-3xl font-bold text-text-dark mb-2">Split Bill</h1>
            <p className="text-text-light">Choose how to split the payment</p>
          </div>

          {/* Total Bill Card */}
          <div className="bg-primary-greenLight bg-opacity-20 rounded-lg p-6 mb-6">
            <div className="text-sm text-text-light mb-1">Total bill</div>
            <div className="text-3xl font-bold text-text-dark">{formatPrice(total)}</div>
          </div>

          {/* Split Options Card */}
          <div className="bg-background-white rounded-lg shadow-card p-6 mb-6">
            {/* Split Mode Selector */}
            <div className="flex gap-2 mb-6 p-1 bg-background-light rounded-lg">
              <button
                onClick={() => setSplitMode('equal')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  splitMode === 'equal'
                    ? 'bg-background-white text-text-dark shadow-sm'
                    : 'text-text-light hover:text-text-dark'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Equal</span>
              </button>
              <button
                onClick={() => setSplitMode('custom')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  splitMode === 'custom'
                    ? 'bg-background-white text-text-dark shadow-sm'
                    : 'text-text-light hover:text-text-dark'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Custom</span>
              </button>
            </div>

            {/* Equal Split Section */}
            {splitMode === 'equal' && (
              <>
                <div className="mb-6">
                  <label className="block text-text-dark font-medium mb-3">Number of people</label>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleDecreasePeople}
                      disabled={numberOfPeople <= 2}
                      className={`w-12 h-12 rounded-full border-2 border-border-light flex items-center justify-center transition-colors ${
                        numberOfPeople <= 2
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:border-primary-green hover:bg-primary-green hover:bg-opacity-10'
                      }`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div className="text-3xl font-bold text-text-dark">{numberOfPeople}</div>
                    <button
                      onClick={handleIncreasePeople}
                      className="w-12 h-12 rounded-full border-2 border-border-light flex items-center justify-center hover:border-primary-green hover:bg-primary-green hover:bg-opacity-10 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border-light">
                  <span className="text-text-light">Per person</span>
                  <span className="text-primary-green font-bold text-lg">{formatPrice(perPersonAmount)}</span>
                </div>
              </>
            )}

            {/* By Items Section - Disabled */}
            {splitMode === 'byItems' && (
              <div className="text-center py-8">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 text-text-lighter">
                  <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-text-light">Select items to split by what each person ordered</p>
              </div>
            )}

            {/* Custom Amount Section */}
            {splitMode === 'custom' && (
              <>
                <div className="mb-6">
                  <label className="block text-text-dark font-medium mb-3">Enter your amount</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={handleAmountChange}
                      className="flex-1 px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:border-primary-green text-text-dark text-xl font-semibold"
                    />
                    <span className="text-text-light font-medium">{currency.toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border-light">
                  <span className="text-text-light">Remaining</span>
                  <span className="text-text-dark font-semibold text-lg">{formatPrice(remaining)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Pay Button at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background-light border-t border-border-light px-4 py-4 shadow-lg z-10">
        <div className="w-full max-w-lg mx-auto">
          <PrimaryButton 
            onClick={handlePayMyPart}
            disabled={!isValidAmount}
          >
            Pay my part
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default SplitBill;

