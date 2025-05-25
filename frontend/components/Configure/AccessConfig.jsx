import React from 'react';

const AccessConfig = ({
  accessConfig,
  setAccessConfig,
  handleSaveAccessConfig
}) => {
  return (
    <div className="p-6 rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-6 text-gray-900">Access Configuration</h2>
      <form onSubmit={handleSaveAccessConfig} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Client ID</label>
          <input
            type="text"
            value={accessConfig.clientId}
            onChange={(e) => setAccessConfig({ ...accessConfig, clientId: e.target.value })}
            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your client ID"
            required
          />
          <p className="mt-1 !text-sm text-gray-500">
            The client ID is used to authenticate your application with the API.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Client Secret</label>
          <input
            type="password"
            value={accessConfig.clientSecret}
            onChange={(e) => setAccessConfig({ ...accessConfig, clientSecret: e.target.value })}
            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your client secret"
            required
          />
          <p className="mt-1 !text-sm text-gray-500">
            The client secret is used to securely authenticate your application. Keep this confidential.
          </p>
        </div>

        <div className="flex items-center hover:cursor-pointer">
          <input
            type="checkbox"
            id="enableAccess"
            checked={accessConfig.enabled}
            onChange={(e) => setAccessConfig({ ...accessConfig, enabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="enableAccess" className="ml-2 block text-sm text-gray-700">
            Enable API Access
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:cursor-pointer text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">API Access Information</h3>
        <div className="space-y-2 !text-sm text-gray-600">
          <p className='!text-sm'>
            • Your API credentials will be used to authenticate requests to the VIP extension API.
          </p>
          <p className='!text-sm'>
            • Make sure to keep your client secret secure and never expose it in client-side code.
          </p>
          <p className='!text-sm'>
            • You can obtain your client ID and secret from the developer dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessConfig; 