import React from 'react';

// Primary button component for consistent styling across the app
const PrimaryButton = ({ children, onClick, className = '', disabled = false, type = 'button' }) => {
  // TODO: Update styling based on design requirements
  const baseClasses = 'px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button 
      className={`${baseClasses} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;