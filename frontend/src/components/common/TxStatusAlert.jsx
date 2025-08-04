// Shows a dismissible alert based on transaction result
import React from 'react';

export default function TxStatusAlert({ status, message, onClose }) {
  if (!status) return null;

  const classes = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
  };

  const icons = {
    success: (
      <svg
        className="h-5 w-5 mr-2 inline-block stroke-current"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg
        className="h-5 w-5 mr-2 inline-block stroke-current"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`border-l-4 p-4 mb-4 ${
        classes[status] || classes.error
      } rounded-md shadow-md flex items-center justify-between`}
      role="alert"
    >
      <div className="flex items-center">
        {icons[status] || icons.error}
        <span className="font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
}
