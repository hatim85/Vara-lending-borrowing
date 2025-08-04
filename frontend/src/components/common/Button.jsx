// Action or navigation button with size, color, and disabled states
import React from 'react';
import clsx from 'clsx'; // optional utility–install via npm if used

/**
 * Props:
 *   - variant: 'primary' | 'secondary' | 'danger'
 *   - size: 'sm' | 'md' | 'lg'
 *   - loading: optional boolean
 *   - className: custom tailwind classes
 *   - children: button label
 *   - ...rest: passed to <button>
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  ...rest
}) {
  const base = 'inline-flex items-center justify-center rounded-md font-semibold transition focus:outline-none';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };
  const colors = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400',
  };
  return (
    <button
      className={clsx(
        base,
        sizes[size],
        colors[variant],
        loading && 'opacity-70 cursor-wait',
        className
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5 mr-2 text-current" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 .613 4.626.613 12H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
