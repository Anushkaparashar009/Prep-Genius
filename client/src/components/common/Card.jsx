import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 shadow-sm backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};