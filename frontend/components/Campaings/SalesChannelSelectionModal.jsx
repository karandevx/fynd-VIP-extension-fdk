import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchSalesChannels,
  toggleChannel,
  toggleAllChannels,
  setInitialState
} from "../../src/features/salesChannels/salesChannelsSlice";
import { toast } from "react-toastify";

const SalesChannelSelectionModal = ({
  showModal,
  onClose,
  selectedChannels,
  onChannelSelect,
  onSelectAllChannels,
}) => {
  const { company_id } = useParams();
  const dispatch = useDispatch();
  const { 
    channels: salesChannels,
    loading,
    error,
    lastFetched,
    isConfigured
  } = useSelector((state) => state.salesChannels);
  const [searchTerm, setSearchTerm] = React.useState("");

  useEffect(() => {
    if (showModal) {
      // Only fetch if we don't have data or if it's stale (older than 5 minutes)
      const shouldFetch = !salesChannels?.length || !lastFetched || (Date.now() - new Date(lastFetched).getTime() > 5 * 60 * 1000);
      if (shouldFetch) {
        dispatch(fetchSalesChannels(company_id));
      }
    }
  }, [showModal, company_id, dispatch, salesChannels?.length, lastFetched]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRefresh = () => {
    dispatch(fetchSalesChannels(company_id));
  };

  const handleChannelSelect = (channelId) => {
    dispatch(toggleChannel(channelId));
    onChannelSelect(channelId);
  };

  const handleSelectAll = () => {
    const allOriginalChannelsSelected = selectedChannels.every(channelId =>
      selectedChannels.includes(channelId)
    );
    
    if (!allOriginalChannelsSelected) {
      return;
    }

    dispatch(toggleAllChannels({
      allSelected: allOriginalChannelsSelected,
      channels: filteredChannels
    }));
    onSelectAllChannels(filteredChannels.map(channel => channel.id));
  };

  if (!showModal) return null;

  const filteredChannels = salesChannels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.domain?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allVisibleSelected =
    filteredChannels.length > 0 &&
    filteredChannels.every((channel) => selectedChannels.includes(channel.id));

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">Select Sales Channels</h2>
              {isConfigured && (
                <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full border border-green-200">
                  Configured
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-blue-600 transition-all duration-200 hover:bg-white rounded-lg"
                title="Refresh channels"
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
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
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="p-6 bg-white border-b border-gray-100">
          <div className="space-y-4">
            {/* Search Control */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200"
              />
            </div>

            {/* Select All Checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={handleSelectAll}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Select All ({filteredChannels.length} visible)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Sales Channel List */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full max-w-2xl animate-pulse flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="h-10 w-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="h-4 w-16 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredChannels.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredChannels.map((channel) => (
                <label
                  key={channel.id}
                  className="flex items-center p-4 hover:bg-white transition-colors duration-200 group"
                >
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes(channel.id)}
                    onChange={() => handleChannelSelect(channel.id)}
                    className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200 bg-white ${selectedChannels.includes(channel.id) ? 'checked:bg-blue-600 bg-blue-600' : ''}`}
                  />
                  <div className="ml-4 flex-1 flex items-center gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center shadow-sm">
                      {channel.logo?.secure_url ? (
                        <img
                          src={channel.logo.secure_url}
                          alt={channel.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                          <span className="text-lg font-semibold text-blue-600">
                            {channel.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {channel.name}
                      </div>
                      {channel.domain?.name && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {channel.domain.name}
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 font-medium">No sales channels found matching your criteria.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
