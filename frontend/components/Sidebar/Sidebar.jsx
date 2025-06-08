import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    {
      title: "Main Menu",
      items: [
        { label: "Configure", path: "configure", icon: "⚙️" },
        { label: "VIPs", path: "customers", icon: "👥" },
        { label: "Campaigns", path: "campaigns", icon: "🎯" },
        { label: "AI Analyst", path: "dashboard", icon: "📊" },
      ],
    },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 overflow-y-auto bg-white text-gray-800 border-r border-gray-200 shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-extrabold text-blue-600">VIP-Customer</h2>
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
                          ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
