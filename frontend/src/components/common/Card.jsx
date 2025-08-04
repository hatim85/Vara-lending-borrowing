// Generic card container with optional footer slot
import React from 'react';

/**
 * Props:
 *   - className: custom Tailwind classes
 *   - children: content
 *   - footer: optional JSX
 */
export default function Card({ className = '', children, footer = null }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 ${className}`}
    >
      <div className="space-y-4">{children}</div>
      {footer && <div className="mt-4 border-t pt-3">{footer}</div>}
    </div>
  );
}
