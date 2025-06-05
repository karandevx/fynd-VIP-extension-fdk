// Utility functions for Customers.jsx

/**
 * Filter customers by search term and selected sales channel.
 */
export function filterCustomers(customers, searchTerm, selectedChannel) {
  let result = [...customers];
  if (searchTerm) {
    result = result.filter(customer =>
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    );
  }
  if (selectedChannel !== 'all') {
    result = result.filter(customer => customer.applicationId === selectedChannel);
  }
  return result;
}

/**
 * Sort customers by a given field and direction.
 */
export function sortCustomers(customers, sortField, sortDirection) {
  return [...customers].sort((a, b) => {
    let aValue, bValue;
    if (sortField === 'VIPExpiry') {
      aValue = a.VIPExpiry ? new Date(a.VIPExpiry) : new Date(0);
      bValue = b.VIPExpiry ? new Date(b.VIPExpiry) : new Date(0);
    } else if (sortField === 'VIPDays') {
      aValue = parseInt(a.VIPDays) || 0;
      bValue = parseInt(b.VIPDays) || 0;
    } else {
      aValue = a[sortField] || '';
      bValue = b[sortField] || '';
    }
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
}

/**
 * Paginate an array of items.
 */
export function paginate(items, currentPage, itemsPerPage) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
}

/**
 * Get sales channel name by id from configured channels.
 */
export function getSalesChannelName(configuredChannels, id) {
  const channel = configuredChannels.find((ch) => ch._id === id || ch.id === id);
  return channel ? channel.name : id;
} 