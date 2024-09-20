
import React from 'react';
import '../styles/TopImage.css'; // Import CSS for styling

const TopImage= ({ imageSrc, logoSrc, logoSize = 80, imageAlt = "Top of the page", logoAlt = "Logo" }) => {
  return (
    <div className="image-with-logo-container">
      <img 
        src={imageSrc} 
        alt={imageAlt} 
        className="top-image" 
      />
      <div className="circle-logo" style={{ width: logoSize, height: logoSize }}>
        <img src={logoSrc} alt={logoAlt} className="logo-image" />
      </div>
    </div>
  );
};

export default TopImage;
