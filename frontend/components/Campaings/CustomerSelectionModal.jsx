import React from 'react';
// import { customers as allCustomers } from '../../constants/customers'; // Keep original data if needed for count, otherwise remove

const CustomerSelectionModal = ({
  showModal,
  onClose,
  selectedCustomers,
  onCustomerSelect,
  onSelectAllCustomers,
  customers, // This is now the already filtered and sorted list from the parent
  customerSearchTerm, // Receive search term from parent
  setCustomerSearchTerm, // Receive search term setter from parent
  customerSortField, // Receive sort field from parent
  setCustomerSortField, // Receive sort field setter from parent
  customerSortDirection, // Receive sort direction from parent
  setCustomerSortDirection, // Receive sort direction setter from parent
  customerFilterVip, // Receive filter status from parent
  setCustomerFilterVip // Receive filter status setter from parent
}) => {
  // Remove internal state for filtering and sorting
  // const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  // const [customerSortField, setCustomerSortField] = useState('firstname');
  // const [customerSortDirection, setCustomerSortDirection] = useState('asc');
  // const [customerFilterVip, setCustomerFilterVip] = useState('all');
  // const [isLoading, setIsLoading] = useState(false); // Assuming loading might be needed for fetching customers later

  // Remove internal handleCustomerSort function
  // const handleCustomerSort = (field) => {
  //   if (customerSortField === field) {
  //     setCustomerSortDirection(customerSortDirection === 'asc' ? 'desc' : 'asc');
  //   } else {
  //     setCustomerSortField(field);
  //     setCustomerSortDirection('asc');
  //   }
  // };

  // Remove internal filtering and sorting logic
  // const filteredAndSortedCustomers = customers
  //   .filter(customer => {
  //     const searchTermLower = customerSearchTerm.toLowerCase();
  //     const matchesSearch = customer.firstname.toLowerCase().includes(searchTermLower) ||
  //                         customer.lastname.toLowerCase().includes(searchTermLower) ||
  //                         customer.email.toLowerCase().includes(searchTermLower) ||
  //                         customer.mobile.includes(customerSearchTerm);

  //     const matchesFilter = customerFilterVip === 'all' ||
  //                         (customerFilterVip === 'vip' && customer.vipRatio > 75) ||
  //                         (customerFilterVip === 'non-vip' && customer.vipRatio <= 75);

  //     return matchesSearch && matchesFilter;
  //   })
  //   .sort((a, b) => {
  //     const aValue = a[customerSortField];
  //     const bValue = b[customerSortField];

  //     if (aValue < bValue) return customerSortDirection === 'asc' ? -1 : 1;
  //     if (aValue > bValue) return customerSortDirection === 'asc' ? 1 : -1;
  //     return 0;
  //   });

  if (!showModal) return null;

  // Determine if all currently visible customers are selected (based on the 'customers' prop)
  const allVisibleSelected = customers.length > 0 && customers.every(c => selectedCustomers.includes(c.id));

  // Modified handleCustomerSort to use the setter received from the parent
  const handleCustomerSort = (field) => {
    if (customerSortField === field) {
      setCustomerSortDirection(customerSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setCustomerSortField(field);
      setCustomerSortDirection('asc');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#cbdaf561] bg-opacity-25 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl h-[90%] overflow-y-auto w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Select Customers</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* Search, Filter, and Sort Controls - Now using props from parent */}
          <div className="mb-4 space-y-4">
            <input
              type="text"
              placeholder="Search customers..."
              value={customerSearchTerm}
              onChange={(e) => setCustomerSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500">
              <span>Filter by:</span>
              <select
                value={customerFilterVip}
                onChange={(e) => setCustomerFilterVip(e.target.value)}
                className="px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Customers</option>
                <option value="vip">VIP Customers ( 75% VIP Ratio)</option>
                <option value="non-vip">Non-VIP Customers ( 75% VIP Ratio)</option>
              </select>
              <span className="ml-auto sm:ml-0">Sort by:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCustomerSort('firstname')}
                  className={`hover:text-blue-600 ${customerSortField === 'firstname' ? 'text-blue-600' : ''}`}
                >
                  First Name {customerSortField === 'firstname' && (customerSortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  type="button"
                  onClick={() => handleCustomerSort('lastname')}
                  className={`hover:text-blue-600 ${customerSortField === 'lastname' ? 'text-blue-600' : ''}`}
                >
                  Last Name {customerSortField === 'lastname' && (customerSortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  type="button"
                  onClick={() => handleCustomerSort('vipRatio')}
                  className={`hover:text-blue-600 ${customerSortField === 'vipRatio' ? 'text-blue-600' : ''}`}
                >
                  VIP Ratio {customerSortField === 'vipRatio' && (customerSortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          </div>

          {/* Select All Checkbox */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={() => onSelectAllCustomers(customers.map(c => c.id))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {/* Update label to reflect only visible customers */}
              <span className="ml-2">{`Select All (${customers.length} visible)`}</span>
            </label>
          </div>

          {/* Customer List */}
          <div className="max-h-96 overflow-y-auto border rounded-md">
            {/* Assuming loading is handled in parent and passed down */}
             {customers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <label
                    key={customer.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => onCustomerSelect(customer.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-900 flex-1">{customer.firstname} {customer.lastname} ({customer.email})</span>
                    <span className="text-sm text-gray-600">VIP Ratio: {customer.vipRatio}%</span>
                  </label>
                ))}
              </div>
            ) : ( // Use the 'customers' prop for checking if list is empty
              <div className="p-4 text-center text-gray-500">
                No customers found matching your criteria.
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Done ({selectedCustomers.length} selected)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSelectionModal; 