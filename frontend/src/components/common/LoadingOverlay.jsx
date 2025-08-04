// Full-screen loading overlay with semi-transparent backdrop
import React from 'react';

export default function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="text-center">
        <svg
          className="animate-spin h-12 w-12 text-blue-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 .613 4.626.613 12H4z"
          />
        </svg>
        <p className="mt-4 text-white text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}
