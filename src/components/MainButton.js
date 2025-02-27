import React from 'react';

const MainButton = ({ onPress, text }) => {
  return (
    <button
      style={{
        width: '80%',
        backgroundColor: 'black',
        padding: '20px 20px',
        borderRadius: '30px',
        color: 'white',
        textAlign: 'center',
        cursor: 'pointer',
        border: 'none',
        fontSize: '16px',
        fontWeight: 'bold',
      }}
      onClick={onPress}
    >
      {text}
    </button>
  );
};

export default MainButton;
