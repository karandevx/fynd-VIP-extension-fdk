import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from 'react-redux';
import { fetchSalesChannels } from '../../src/features/salesChannels/salesChannelsSlice';
import { 
  fetchCustomers, 
  setSearchTerm, 
  setVipType, 
  setSortField, 
  setSortDirection 
} from '../../src/features/customers/customersSlice';

export const Customers = () => {
  const { company_id } = useParams();
  const dispatch = useDispatch();
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { channels: salesChannels, loading: channelsLoading } = useSelector((state) => state.salesChannels);
  const { 
    customers, 
    loading: customersLoading, 
    error: customersError,
    filters: { searchTerm, vipType, sortField, sortDirection },
    lastFetched
  } = useSelector((state) => state.customers);

  // Fetch customers only if data is not available or stale
  useEffect(() => {
    const shouldFetch = !lastFetched || Date.now() - new Date(lastFetched).getTime() > 5 * 60 * 1000; // 5 minutes cache
    if (shouldFetch) {
      dispatch(fetchCustomers(company_id));
    }
  }, [company_id, lastFetched, dispatch]);

  // Fetch sales channels on mount
  useEffect(() => {
    if (salesChannels.length === 0) {
      dispatch(fetchSalesChannels(company_id));
    }
  }, [company_id, dispatch, salesChannels.length]);

  // Handle error
  useEffect(() => {
    if (customersError) {
      toast.error(customersError);
    }
  }, [customersError]);

  // Map applicationId to sales channel name
  const getSalesChannelName = (id) => {
    const channel = salesChannels.find((ch) => ch._id === id);
    return channel ? channel.name : id;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      dispatch(setSortDirection(sortDirection === "asc" ? "desc" : "asc"));
    } else {
      dispatch(setSortField(field));
      dispatch(setSortDirection("asc"));
    }
  };

  // Filter and sort customers
  const filteredCustomers = (customers || [])
    .filter(customer => {
      if (!customer) return false;

      const matchesSearch = searchTerm ? (
        customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
      ) : true;

      const matchesVipType = vipType === 'all' ? true :
        vipType === 'CUSTOM_PROMOTIONS' ? customer.CUSTOM_PROMOTIONS :
        vipType === 'PRODUCT_EXCLUSIVITY' ? customer.PRODUCT_EXCLUSIVITY :
        vipType === 'PRODUCT_EXCLUSIVITY_AND_CUSTOM_PROMOTIONS' ? 
          (customer.PRODUCT_EXCLUSIVITY && customer.CUSTOM_PROMOTIONS) : true;

      const matchesChannel = selectedChannel === 'all' ? true :
        customer.applicationId === selectedChannel;

      return matchesSearch && matchesVipType && matchesChannel;
    })
    .sort((a, b) => {
      let aValue, bValue;
      if (sortField === 'VIPExpiry') {
        aValue = a.VIPExpiry ? new Date(a.VIPExpiry) : new Date(0);
        bValue = b.VIPExpiry ? new Date(b.VIPExpiry) : new Date(0);
      } else if (sortField === 'VIPDays') {
        aValue = parseInt(a.VIPDays) || 0;
        bValue = parseInt(b.VIPDays) || 0;
      } else if (sortField === 'firstName') {
        aValue = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
        bValue = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
      } else {
        aValue = a[sortField] || '';
        bValue = b[sortField] || '';
      }
      return sortDirection === "asc" ? 
        (aValue > bValue ? 1 : -1) : 
        (aValue < bValue ? 1 : -1);
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    dispatch(fetchCustomers(company_id));
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-indigo-600 hover:bg-indigo-50 transition-colors'
        } border border-gray-200`}
      >
        <span className="sr-only">Previous</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded-md text-sm font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-colors border border-gray-200"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2 py-1">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            currentPage === i
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-indigo-600 hover:bg-indigo-50 transition-colors'
          } border border-gray-200`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2 py-1">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 rounded-md text-sm font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-colors border border-gray-200"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-indigo-600 hover:bg-indigo-50 transition-colors'
        } border border-gray-200`}
      >
        <span className="sr-only">Next</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );

    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-8 px-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full text-center md:text-left">
            <h1 className="!text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Customer Management</h1>
            <p className="text-gray-500 !text-base">Manage and analyze your VIP customers with ease.</p>
            <span className="block!text-lg tracking-normal font-medium text-gray-500 mt-1">
              {filteredCustomers.length} total customers
            </span>
          </div>
          {customersLoading && (
            <div className="bg-white p-2 rounded-md shadow flex items-center">
              <svg className="animate-spin h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium text-gray-700">Loading...</span>
            </div>
          )}
        </div>

        {/* Card Container */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-6 py-5 border-b border-gray-100 bg-white/80">
            <div className="relative rounded-md shadow-sm flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search customers..."
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-4 py-3 border-gray-300 rounded-lg text-sm bg-gray-50 shadow-sm"
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              />
            </div>
            {/* VIP Type Filter */}
            <div>
              <select
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={vipType}
                onChange={(e) => dispatch(setVipType(e.target.value))}
              >
                <option value="all">All VIP Types</option>
                <option value="CUSTOM_PROMOTIONS">Custom Promotions</option>
                <option value="PRODUCT_EXCLUSIVITY">Product Exclusivity</option>
                <option value="PRODUCT_EXCLUSIVITY_AND_CUSTOM_PROMOTIONS">Product Exclusivity and Custom Promotions</option>
              </select>
            </div>
            {/* Sales Channel Filter */}
            <div>
              <select
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={selectedChannel}
                onChange={e => setSelectedChannel(e.target.value)}
              >
                <option value="all">All Sales Channels</option>
                {salesChannels.map(channel => (
                  <option key={channel._id} value={channel._id}>{channel.name}</option>
                ))}
              </select>
            </div>
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 shadow-sm transition-all duration-200 flex items-center justify-center"
              title="Refresh customers"
              disabled={customersLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${customersLoading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          {/* Table - horizontally scrollable only for table */}
          <div className="overflow-x-auto w-full">
            <table className="min-w-[900px] w-full divide-y divide-gray-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4 text-left min-w-[180px]">Name</th>
                  <th className="px-6 py-4 text-left min-w-[150px]">Phone</th>
                  <th className="px-6 py-4 text-left min-w-[250px]">Email</th>
                  <th
                    className="px-6 py-4 text-left min-w-[100px] cursor-pointer select-none hover:text-indigo-700"
                    onClick={() => handleSort('VIPDays')}
                  >
                    <div className="flex items-center gap-1">
                      <span>VIP Days</span>
                      {sortField === 'VIPDays' && (
                        <svg className={`w-4 h-4 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0zM10 15.586l-3.293-3.293a1 1 0 11.414-1.414L10 14.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left min-w-[140px] cursor-pointer select-none hover:text-indigo-700"
                    onClick={() => handleSort('VIPExpiry')}
                  >
                    <div className="flex items-center gap-1">
                      <span>VIP Expiry</span>
                      {sortField === 'VIPExpiry' && (
                        <svg className={`w-4 h-4 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0zM10 15.586l-3.293-3.293a1 1 0 11.414-1.414L10 14.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left min-w-[200px]">Sales Channel</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {customersLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="text-base font-medium">Loading customers...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center px-6 py-16 text-gray-400 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-blue-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h3m4 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-lg font-semibold">No customers found</span>
                        <span className="text-sm text-gray-500">Try adjusting your search or filters.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-blue-50/60 transition-all">
                      <td className="py-4 whitespace-nowrap">
                        <div className="flex items-center ml-6">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-800 font-medium text-sm">
                              {customer.firstName?.charAt(0) || ''}{customer.lastName?.charAt(0) || ''}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-center text-gray-700">{customer.phone || 'N/A'}</td>
                      <td className="py-4 text-sm text-center text-gray-700 max-w-[230px] truncate " title={customer.email}>{customer.email || 'No email'}</td>
                      <td className="py-4 text-sm text-center text-gray-700">{customer.VIPDays || 'N/A'}</td>
                      <td className="py-4 text-sm text-center text-gray-700">{customer.VIPExpiry ? new Date(customer.VIPExpiry).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-4 text-sm text-center text-gray-700 max-w-[200px] flex items-center ml-6 gap-2" title={getSalesChannelName(customer.applicationId)}>
                        {(() => {
                          const channel = salesChannels.find((ch) => ch._id === customer.applicationId);
                          return channel ? (
                            <>
                              {channel.logo?.secure_url && (
                                <img
                                  src={channel.logo.secure_url}
                                  alt={channel.name}
                                  className="inline-block h-6 w-6 rounded-full object-cover mr-2"
                                  style={{ minWidth: 24, minHeight: 24 }}
                                />
                              )}
                              <span>{channel.name}</span>
                            </>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - only if more than 15 entries */}
          {filteredCustomers.length > 15 && currentCustomers.length > 0 && (
            <div className="bg-white px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, filteredCustomers.length)}</span> of <span className="font-medium">{filteredCustomers.length}</span> results
              </div>
              <div className="flex space-x-1">
                {renderPagination()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
