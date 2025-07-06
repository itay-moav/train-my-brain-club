import React from 'react';

// Subtitle component for consistent h2 styling across the app
const Subtitle = ({ children, className = '' }) => {
  // TODO: Update styling based on design requirements
  const baseClasses = 'text-xl font-semibold mb-3 text-gray-200';
  
  return (
    <h2 className={`${baseClasses} ${className}`}>{children}</h2>
  );
};

export default Subtitle;