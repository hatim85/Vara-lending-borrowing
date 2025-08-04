// src/components/common/CardButton.jsx

import React from 'react';
import clsx from 'clsx';
import Button from './Button'; // optional if you want a button inside the card

/**
 * CardButton - a full-card clickable card.
 *
 * Props:
 *   title (string): card heading
 *   description (string): card body text
 *   onClick (function): callback for mouse / key interaction
 *   href (string) optional: link to navigate (using <a> instead of <div>)
 *   className (string): custom Tailwind classes
 *   disabled (boolean): if true, style as disabled and ignore clicks
 */
export default function CardButton({
  title,
  description,
  onClick,
  href,
  className = '',
  disabled = false,
}) {
  const Tag = href ? 'a' : 'div';

  return (
    <Tag
      href={href}
      onClick={disabled ? undefined : onClick}
      className={clsx(
        'flex flex-col cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg hover:ring-2 transition',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="px-6 py-8 md:px-8 md:py-10 flex-1">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
      </div>
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl text-right">
        <span className="text-blue-600 dark:text-blue-400 font-semibold">→</span>
      </div>
    </Tag>
  );
}
