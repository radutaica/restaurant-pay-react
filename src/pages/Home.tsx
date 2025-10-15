import React, {useState} from 'react';
import topImage from '../assets/brunch.jpg';
import logo from '../assets/demo_logo.png';
import TopImage from '../components/TopImage';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {

  const [isPressed, setIsPressed] = useState<boolean>(false);
  const navigate = useNavigate(); 

  return (
    <div className="text-center relative h-screen overflow-y-auto">
     <TopImage 
        imageSrc={topImage}
        logoSrc={logo}
        logoSize={80}
      />
      <div className="mt-16 p-5">
        <p className="text-gray-400">Table Ground Floor: 34</p>
        <h1 className="text-2xl font-bold mt-4">Welcome to the fastest way to pay</h1>
      </div>
      <div className="flex justify-center items-center h-1/5">
        <div
          className={`w-4/5 bg-black py-5 px-5 rounded-full text-white text-center cursor-pointer select-none transition-opacity duration-200 ${
            isPressed ? 'opacity-20' : 'opacity-100'
          }`}
          onClick={() => {
            setIsPressed(!isPressed);
            navigate('/checkout');
          }}
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
