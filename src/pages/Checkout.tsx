import React, {useState} from 'react';
import topImage from '../assets/brunch.jpg';
import logo from '../assets/demo_logo.png';
import TopImage from '../components/TopImage';
// import { MdOutlineSubdirectoryArrowRight } from "react-icons/md";
import { useNavigate } from 'react-router-dom';


const Checkout: React.FC = () => {
  const navigate = useNavigate(); 
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const foodItems = [
    { id: 1, name: 'Burger', cost: 5.99, quantity: 1, extra: 'Add Bacon', extra_cost: 3.50 },
    { id: 2, name: 'Pizza', cost: 8.99, quantity: 2 },
    { id: 3, name: 'Sushi', cost: 12.50, quantity: 1 },
    { id: 4, name: 'Pasta', cost: 7.25, quantity: 3 },
    { id: 5, name: 'Salad', cost: 4.99, quantity: 1 },
  ];
  const calculate_total = () => {
    let total = 0
    foodItems.map((item) => (
      item.extra_cost ? total += (item.cost *item.quantity + item.extra_cost) : total += item.cost * item.quantity
      
    ))
    return total
  }

  return (
    <div className="text-center relative h-screen overflow-y-auto">
     <TopImage 
        imageSrc={topImage}
        logoSrc={logo}
        logoSize={80}
      />
      <div className="flex justify-between px-4">
        <div className="text-left">
            <p className="text-3xl font-medium">Pay your bill</p>
            <p className="text-gray-400 -mt-5">Table Ground Floor: 34</p>
        </div>
        <div className="flex items-start">
            <p className="text-3xl font-medium">${calculate_total()}</p>
        </div>
      </div>
      <div className="bg-gray-200 p-2 border rounded-3xl mx-2 my-4">
      {foodItems.map((item) => (
        <li key={item.id} className="flex justify-between py-2 px-5">
          <span className="flex flex-col items-start">
            <span className="flex items-center">
              <span className="bg-white text-black py-1 px-2 rounded mr-2 text-sm">
                {item.quantity}
              </span>
              <span>{item.name}</span>
            </span>
            {item.extra ? (
              <span className="text-xs text-gray-500 mt-1 ml-8 flex items-center">
                <span className="text-base -mt-1 mr-1">↳</span>
                <span className="mr-1">{item.extra}</span>
                (${item.extra_cost})
              </span>
            ) : null}
          </span>
          <span>${item.cost * item.quantity}</span>
        </li>
      
      ))}
      </div>
      <div className="flex justify-center items-center mt-12">
        <div
          className={`w-4/5 bg-black py-5 px-5 rounded-full text-white text-center cursor-pointer select-none transition-opacity duration-200 ${
            isPressed ? 'opacity-20' : 'opacity-100'
          }`}
          onClick={() => {
            setIsPressed(!isPressed);
            navigate('/checkoutform');
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

export default Checkout;
