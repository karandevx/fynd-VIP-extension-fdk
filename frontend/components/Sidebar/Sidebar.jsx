import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    {
      title: 'Main Menu',
      items: [
        { label: 'Dashboard', path: 'dashboard', icon: '📊' },
        { label: 'Customers', path: 'customers', icon: '👥' },
        { label: 'Campaigns', path: 'campaigns', icon: '🎯' },
        { label: 'Configure', path: 'configure', icon: '⚙️' }
      ]
    }
  ];

  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">VIP-Customer</h2>
      </div>
      <nav className="mt-4">
        {menuItems.map((section, index) => (
          <div key={index} className="mb-4">
            <ul>
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 ${
                        isActive ? 'bg-gray-700 text-white' : ''
                      }`
                    }
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
