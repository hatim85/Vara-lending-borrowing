import React from 'react';
import { NavLink } from 'react-router-dom';

export default function NavTabs({ isAdmin }) {
  return (
    <nav className="tabs flex gap-4 border-b p-4">
      <NavLink
        to="/borrow"
        className={({ isActive }) =>
          isActive
            ? 'tab-active'
            : 'tab'
        }
      >
        Borrow
      </NavLink>
      <NavLink
        to="/lend"
        className={({ isActive }) =>
          isActive
            ? 'tab-active'
            : 'tab'
        }
      >
        Lend
      </NavLink>
      {isAdmin && (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            isActive
              ? 'tab-active'
              : 'tab'
          }
        >
          Admin Panel
        </NavLink>
      )}
    </nav>
  );
}
