import React from 'react';

// Simple centered spinner with transparent background
export default function Spinner() {
  return (
    <div className="fixed inset bg-[rgba(0,0,0,0.73)] inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="flex flex-col items-center gap-4 pointer-events-auto">
        <div 
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
          role="status"
          aria-label="Loading"
        />
       
      </div>
    </div>
  );
}

