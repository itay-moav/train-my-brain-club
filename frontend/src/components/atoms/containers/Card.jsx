import React from 'react';

// Card container component for consistent styling
const Card = ({ children, className = '' }) => {
  // TODO: Update styling based on design requirements
  const baseClasses = 'bg-gray-800 rounded-lg p-6 shadow-lg';
  
  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;