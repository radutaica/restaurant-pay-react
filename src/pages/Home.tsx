import React, {useEffect, useState} from 'react';
import topImage from '../assets/brunch.jpg';
import logo from '../assets/demo_logo.png';
import TopImage from '../components/TopImage';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BillSessionService, BillSessionResponse } from '../api';
import { sessionStorageUtils } from '../utils/sessionStorage';

const Home: React.FC = () => {
  const [isPressed, setIsPressed] = useState<boolean>(false);
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
          // Store session_token in sessionStorage (best practice for session tokens)
          sessionStorageUtils.setSessionToken(response.session_token);
          
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

  const handlePayBill = () => {
    navigate('/checkout');
  };

  return (
    <div className="text-center relative h-screen overflow-y-auto">
     <TopImage 
        imageSrc={topImage}
        logoSrc={logo}
        logoSize={80}
      />
      <div className="mt-10 p-5">
        {isLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : sessionData ? (
          <>
            <p className="text-gray-400">{sessionData.venue.name}</p>
            <p className="text-gray-400">{sessionData.table.name}</p>
          </>
        ) : (
          <p className="text-gray-400">Table Ground Floor: 34</p>
        )}
        <h1 className="text-2xl font-bold mt-20 px-8">Welcome to the fastest way to pay</h1>
      </div>
      <div className="flex justify-center items-center h-1/5">
        <div
          className={`w-4/5 bg-black py-5 px-5 rounded-full text-white text-center cursor-pointer select-none transition-opacity duration-200 ${
            isPressed ? 'opacity-20' : 'opacity-100'
          } ${!sessionData && !isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={sessionData ? handlePayBill : undefined}
        >
          Pay the bill
        </div>
      </div>
      <p className="flex items-end fixed bottom-2 left-0 w-full justify-center p-2 bg-transparent text-sm text-gray-600">
        Pay securely with Stripe
      </p>
    </div>
  );
};

export default Home;
