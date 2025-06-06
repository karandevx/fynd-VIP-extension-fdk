import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export const Customers = () => {
  const { company_id } = useParams();
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("firstName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [salesChannels, setSalesChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('all');

  const fetchCustomers = async () => {
    setPageLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_FETCH_BACKEND_URL}?module=users&companyId=${company_id}&queryType=scan`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.data.success) {
        setCustomers(response.data.data);
        setFilteredCustomers(response.data.data);
      } 
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [company_id]);

  // Fetch sales channels on mount
  useEffect(() => {
    const fetchSalesChannels = async () => {
      try {
        const response = await axios.get(
          `https://fetch-db-data-d9ca324b.serverless.boltic.app?module=salesChannels&companyId=${company_id}`,
          { headers: { 'Content-Type': 'application/json' } }
        );
        if (response.data.success) {
          setSalesChannels(response.data.data);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchSalesChannels();
  }, [company_id]);

  // Map applicationId to sales channel name
  const getSalesChannelName = (id) => {
    const channel = salesChannels.find((ch) => ch._id === id);
    return channel ? channel.name : id;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    let result = [...customers];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(customer => 
        customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
      );
    }

    // Filter by sales channel
    if (selectedChannel !== 'all') {
      result = result.filter(customer => customer.applicationId === selectedChannel);
    }

    // Sorting
    result.sort((a, b) => {
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
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCustomers(result);
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection, customers, selectedChannel]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
    <div className="min-h-screen ">
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="!text-2xl text-center w-full font-extrabold text-gray-900 tracking-tight">
            Customer Management
            <span className="block !text-xl tracking-normal font-medium text-gray-500 mt-1">
              {filteredCustomers.length} total customers
            </span>
          </h1>
          
          {pageLoading ? (
            <div className="bg-white p-2 rounded-md shadow flex items-center">
              <svg className="animate-spin h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium text-gray-700">Loading...</span>
            </div>
          ) : null}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative rounded-md shadow-sm flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-4 py-3 border-gray-300 rounded-md text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Sales Channel Filter Dropdown */}
              <div>
                <select
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={selectedChannel}
                  onChange={e => setSelectedChannel(e.target.value)}
                >
                  <option value="all">All Sales Channels</option>
                  {salesChannels.map(channel => (
                    <option key={channel._id} value={channel._id}>{channel.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Table - horizontally scrollable only for table */}
          <div className="overflow-x-auto w-full">
            <table className="min-w-[900px] w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left min-w-[180px]">Name</th>
                  <th className="px-6 py-3 text-left min-w-[150px]">Phone</th>
                  <th className="px-6 py-3 text-left min-w-[250px]">Email</th>
                  <th
                    className="px-6 py-3 text-left min-w-[100px] cursor-pointer select-none hover:text-indigo-700"
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
                    className="px-6 py-3 text-left min-w-[140px] cursor-pointer select-none hover:text-indigo-700"
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
                  <th className="px-6 py-3 text-left min-w-[200px]">Sales Channel</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pageLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></div>
                        Loading customers...
                      </div>
                    </td>
                  </tr>
                ) : currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center px-6 py-10 text-gray-500">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  currentCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                      <td className=" py-4 whitespace-nowrap">
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
                            customer.applicationId || 'N/A'
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
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
