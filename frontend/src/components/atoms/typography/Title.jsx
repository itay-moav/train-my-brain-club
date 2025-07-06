import React from 'react';

// Main title component for consistent h1 styling across the app
const Title = ({ children, className = '' }) => {
  // TODO: Update styling based on design requirements
  const baseClasses = 'text-3xl font-bold mb-4 text-white';
  
  return (
    <h1 className={`${baseClasses} ${className}`}>{children}</h1>
  );
};

export default Title;