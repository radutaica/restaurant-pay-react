import React, {useEffect, useState} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BillSessionService, BillSessionResponse } from '../api';
import { sessionStorageUtils } from '../utils/sessionStorage';
import BrandingHeader from '../components/BrandingHeader';
import InfoCard from '../components/InfoCard';
import ActionItem from '../components/ActionItem';
import PrimaryButton from '../components/PrimaryButton';
import FooterDisclaimer from '../components/FooterDisclaimer';
import { BillIcon, CreditCardIcon } from '../components/icons';

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionData, setSessionData] = useState<BillSessionResponse | null>(null);
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('t');
    if (slug && token) {
      setIsLoading(true);
      BillSessionService.createSession(slug, token)
        .then((response) => {
          // Store all session data (session_token, table_id, bill_id, venue info, etc.)
          sessionStorageUtils.setSessionData(response);
          
          // Store session data for display
          setSessionData(response);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to create bill session', error);
          setIsLoading(false);
        });
    }
  }, [slug, location.search]);

  const handleViewBill = () => {
    navigate('/checkout');
  };

  // Default values for when session data is not loaded
  const restaurantName = sessionData?.venue.name || 'Restaurant';
  const tableName = sessionData?.table.name || 'Table';

  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <BrandingHeader />
        
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-text-light">Loading...</p>
          </div>
        ) : (
          <>
            <InfoCard restaurantName={restaurantName} tableName={tableName}>
              <ActionItem
                icon={<BillIcon />}
                text="View your bill and items"
              />
              <ActionItem
                icon={<CreditCardIcon />}
                text="Pay securely with Apple Pay, Google Pay, or card"
              />
            </InfoCard>

            <div className="mb-8">
              <PrimaryButton
                onClick={handleViewBill}
                disabled={!sessionData && !isLoading}
              >
                View Bill & Pay
              </PrimaryButton>
            </div>
          </>
        )}

        <FooterDisclaimer />
      </div>
    </div>
  );
};

export default Home;
