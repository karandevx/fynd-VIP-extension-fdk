import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const SalesChannelSelectionModal = ({
  showModal,
  onClose,
  selectedChannels, // Receive selectedChannels from parent
  onChannelSelect, // Receive channel selection handler from parent
  onSelectAllChannels // Receive select all handler from parent
}) => {
  const { company_id } = useParams();
  const [loading, setLoading] = useState(false);
  const [salesChannels, setSalesChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSalesChannels = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_FETCH_BACKEND_URL}?module=salesChannels&companyId=${company_id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("Fetched sales channels in modal:", response.data);
      if (response.data.success) {
        setSalesChannels(response.data.data);
      } else {
        throw new Error('Failed to fetch sales channels');
      }
    } catch (error) {
      console.error('Error fetching sales channels:', error);
      toast.error('Failed to fetch sales channels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) { // Fetch channels only when modal is shown
      fetchSalesChannels();
    }
  }, [showModal, company_id]);

  if (!showModal) return null;

  const filteredChannels = salesChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.domain?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Determine if all currently visible channels are selected
  const allVisibleSelected = filteredChannels.length > 0 && filteredChannels.every(channel => selectedChannels.includes(channel.id));

  return (
    <div className="fixed inset-0 bg-[#cbdaf561] bg-opacity-25 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl h-[90%] overflow-y-auto w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Select Sales Channels</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* Search Control */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Select All Checkbox */}
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={() => onSelectAllChannels(filteredChannels.map(channel => channel.id))} // Pass filtered channel IDs
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-900">{`Select All (${filteredChannels.length} visible)`}</span>
            </label>
          </div>

          {/* Sales Channel List */}
          <div className="max-h-80 overflow-y-auto border rounded-md">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  Loading channels...
                </div>
              </div>
            ) : filteredChannels.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredChannels.map((channel) => (
                  <label
                    key={channel.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onChannelSelect(channel.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(channel.id)} // Check against selectedChannels prop
                      onChange={() => onChannelSelect(channel.id)} // Use onChannelSelect prop
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                    />
                     <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center mr-3">
                      {channel.logo?.secure_url ? (
                        <img
                          src={channel.logo.secure_url}
                          alt={channel.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100">
                          <span className="text-sm font-medium text-gray-600">
                            {channel.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className='flex flex-col'>
                      <span className="text-sm font-medium text-gray-900">{channel.name}</span>
                      {channel.domain?.name && <span className="text-xs text-gray-500">{channel.domain.name}</span>}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No sales channels found matching your criteria.
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Done ({selectedChannels.length} selected)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChannelSelectionModal; 