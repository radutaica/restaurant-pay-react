
import React from 'react';

interface TopImageProps {
  imageSrc: string;
  logoSrc: string;
  logoSize?: number;
  imageAlt?: string;
  logoAlt?: string;
}

const TopImage: React.FC<TopImageProps> = ({ imageSrc, logoSrc, logoSize = 80, imageAlt = "Top of the page", logoAlt = "Logo" }) => {
  return (
    <div className="text-center relative">
      <img 
        src={imageSrc} 
        alt={imageAlt} 
        className="w-full max-h-80 object-cover rounded-b-2xl shadow-lg" 
      />
      <div 
        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden"
        style={{ width: logoSize, height: logoSize }}
      >
        <img src={logoSrc} alt={logoAlt} className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default TopImage;
