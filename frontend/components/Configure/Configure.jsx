import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const Configure = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('membership');
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    duration: '',
    benefits: []
  });

  const handleAddPlan = (e) => {
    e.preventDefault();
    setMembershipPlans([...membershipPlans, { ...newPlan, id: Date.now() }]);
    setNewPlan({ name: '', price: '', duration: '', benefits: [] });
  };

  return (
    <div className={`p-6 min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Configure VIP Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your VIP membership plans and settings</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('membership')}
              className={`${
                activeTab === 'membership'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Membership Plans
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              General Settings
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'membership' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create New Plan Form */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h2 className="text-lg font-semibold mb-4">Create New Membership Plan</h2>
              <form onSubmit={handleAddPlan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (months)</label>
                  <input
                    type="number"
                    value={newPlan.duration}
                    onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Plan
                </button>
              </form>
            </div>

            {/* Existing Plans */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h2 className="text-lg font-semibold mb-4">Existing Plans</h2>
              <div className="space-y-4">
                {membershipPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{plan.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ${plan.price} / {plan.duration} months
                        </p>
                      </div>
                      <button className="text-red-600 hover:text-red-700">Delete</button>
                    </div>
                  </div>
                ))}
                {membershipPlans.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No membership plans created yet
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className="text-lg font-semibold mb-4">General Settings</h2>
            {/* Add your general settings form here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Configure;