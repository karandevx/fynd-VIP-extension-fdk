import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = () => {
  const { isDarkMode } = useTheme();
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
    <div className={`w-64 h-screen fixed left-0 top-0 overflow-y-auto ${
      isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
    } border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
                      `flex items-center space-x-3 px-4 py-3 ${
                        isActive
                          ? isDarkMode
                            ? 'bg-gray-700 text-white'
                            : 'bg-blue-50 text-blue-600'
                          : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } transition-colors`
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
