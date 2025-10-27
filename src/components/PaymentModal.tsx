import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [showSplitOptions, setShowSplitOptions] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setShowSplitOptions(false);
    onClose();
  };

  const handleSplitBill = () => {
    setShowSplitOptions(true);
  };

  const handleBackToMain = () => {
    setShowSplitOptions(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white w-full max-w-md rounded-t-3xl p-6 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          {showSplitOptions ? (
            <>
              <button
                onClick={handleBackToMain}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="text-gray-600 text-2xl font-bold">←</span>
              </button>
              <h2 className="text-xl font-semibold text-gray-800">Split the bill</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="text-gray-600 text-2xl font-bold">×</span>
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800">Pay your bill</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="text-gray-600 text-2xl font-bold">×</span>
              </button>
            </>
          )}
        </div>

        {/* Content based on view */}
        {showSplitOptions ? (
          /* Split Options View */
          <div className="space-y-4">
            <button
              className="w-full bg-black py-5 px-5 rounded-full text-white text-center cursor-pointer select-none transition-opacity duration-200 hover:opacity-80 flex items-center justify-center"
              onClick={() => {
                handleClose();
                navigate('/checkoutform');
              }}
            >
              <span className="mr-2">📋</span>
              Pay for your items
            </button>
            
            <button
              className="w-full bg-black py-5 px-5 rounded-full text-white text-center cursor-pointer select-none transition-opacity duration-200 hover:opacity-80 flex items-center justify-center"
              onClick={() => {
                handleClose();
                navigate('/checkoutform');
              }}
            >
              <span className="mr-2">⚖️</span>
              Divide the bill equally
            </button>
            
            <button
              className="w-full bg-black py-5 px-5 rounded-full text-white text-center cursor-pointer select-none transition-opacity duration-200 hover:opacity-80 flex items-center justify-center"
              onClick={() => {
                handleClose();
                navigate('/checkoutform');
              }}
            >
              <span className="mr-2">✏️</span>
              Pay a custom amount
            </button>
          </div>
        ) : (
          /* Initial View */
          <div className="space-y-4">
            <button
              className="w-full bg-black py-5 px-5 rounded-full text-white text-center cursor-pointer select-none transition-opacity duration-200 hover:opacity-80"
              onClick={handleSplitBill}
            >
              Split the bill
            </button>
            
            <button
              className="w-full bg-black py-5 px-5 rounded-full text-white text-center cursor-pointer select-none transition-opacity duration-200 hover:opacity-80"
              onClick={() => {
                handleClose();
                navigate('/checkoutform');
              }}
            >
              Pay full bill
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
