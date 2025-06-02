import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCustomers } from "../../src/features/customersSlice";
import { fetchSalesChannels } from "../../src/features/salesChannelsSlice";
import { toast } from "react-toastify";
import { HiOutlineRefresh } from "react-icons/hi";
import { filterCustomers, sortCustomers, paginate, getSalesChannelName } from '../../utils/customerUtils';
import { renderPagination } from '../../utils/paginationUtils';

export const Customers = () => {
  const { company_id } = useParams();
  const dispatch = useDispatch();
  const { items: customers, loading: pageLoading, error } = useSelector((state) => state.customers);
  const { items: salesChannels } = useSelector((state) => state.salesChannels);
  const configuredChannelIds = useSelector((state) => state.configure.salesChannels);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("firstName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedChannel, setSelectedChannel] = useState('all');

  const customersLoaded = customers.length > 0;
  const salesChannelsLoaded = salesChannels.length > 0;

  useEffect(() => {
    if (company_id) {
      if (!customersLoaded) dispatch(fetchCustomers(company_id));
      if (!salesChannelsLoaded) dispatch(fetchSalesChannels(company_id));
    }
  }, [company_id, dispatch, customersLoaded, salesChannelsLoaded]);

  const handleRefresh = () => {
    if (company_id) {
      dispatch(fetchCustomers(company_id));
      dispatch(fetchSalesChannels(company_id));
    }
  };

  // Only show channels that are in configure.salesChannels
  const configuredChannels = salesChannels.filter(channel => configuredChannelIds.includes(channel.id));

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    let result = filterCustomers(customers, searchTerm, selectedChannel);
    result = sortCustomers(result, sortField, sortDirection);
    setFilteredCustomers(result);
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection, customers, selectedChannel]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentCustomers = paginate(filteredCustomers, currentPage, itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen ">
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center w-full justify-between mx-6">
            <h1 className="!text-2xl font-extrabold text-gray-900 tracking-tight">
              Customer Management
              <span className="block !text-xl tracking-normal font-medium text-gray-500 mt-1">
                {filteredCustomers.length} total customers
              </span>
            </h1>
            <button
              onClick={handleRefresh}
              title="Refresh Data"
              className="ml-4 p-2 rounded-full bg-gray-100 hover:bg-indigo-200 transition-colors border border-gray-200 shadow-sm flex items-center justify-center"
              aria-label="Refresh Data"
            >
              <HiOutlineRefresh className=" text-indigo-600" />
            </button>
          </div>
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
                  {configuredChannels.map(channel => (
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
                      <td className="py-4 text-sm text-center text-gray-700 truncate">{customer.phone || 'N/A'}</td>
                      <td className="py-4 text-sm text-center text-gray-700 max-w-[230px] truncate " title={customer.email}>{customer.email || 'No email'}</td>
                      <td className="py-4 text-sm text-center text-gray-700">{customer.VIPDays || 'N/A'}</td>
                      <td className="py-4 text-sm text-center text-gray-700">{customer.VIPExpiry ? new Date(customer.VIPExpiry).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-4 text-sm text-center text-gray-700 max-w-[200px] flex items-center ml-6 gap-2" title={getSalesChannelName(configuredChannels, customer.applicationId)}>
                        {(() => {
                          const channel = configuredChannels.find((ch) => ch._id === customer.applicationId || ch.id === customer.applicationId);
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
          {filteredCustomers.length > 10 && currentCustomers.length > 0 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{currentPage * itemsPerPage - itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</span> of <span className="font-medium">{filteredCustomers.length}</span> results
              </div>
              <div className="flex space-x-1">
                {renderPagination(currentPage, totalPages, handlePageChange)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
