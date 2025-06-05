import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { saveAccessConfig, setAccessConfig } from "../../src/features/configureSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AccessConfig = ({ accessConfig, company_id, disabled }) => {
  const dispatch = useDispatch();
  const { accessConfig: reduxAccessConfig, saving } = useSelector((state) => state.configure);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        saveAccessConfig({ 
          company_id: company_id,
          clientId: reduxAccessConfig.clientId,
          clientSecret: reduxAccessConfig.clientSecret,
        })
      ).unwrap();
      toast.success("Configuration saved successfully!");
    } catch (error) {
      toast.error("Failed to save configuration");
    }
  };

  return (
    <div className="p-6 rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Access Configuration
        </h2>
        {!disabled && (
          <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
            Configured
          </span>
        )}
      </div>

      {!disabled ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Client ID
            </label>
            <div className="w-full px-3 py-2 bg-gray-50 border rounded-md border-gray-300 text-gray-700">
              {reduxAccessConfig?.clientId}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Client Secret
            </label>
            <div className="w-full px-3 py-2 bg-gray-50 border rounded-md border-gray-300 text-gray-700">
              ••••••••••••••••
            </div>
          </div>
        </div>
      ) : (
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Client ID
            </label>
            <input
              type="text"
              value={reduxAccessConfig.clientId}
              onChange={(e) =>
                dispatch(setAccessConfig({ ...reduxAccessConfig, clientId: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your client ID"
              required
            />
            <p className="mt-1 !text-sm text-gray-500">
              The client ID is used to authenticate your application with the
              API.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Client Secret
            </label>
            <input
              type="password"
              value={reduxAccessConfig.clientSecret}
              onChange={(e) =>
                dispatch(setAccessConfig({ ...reduxAccessConfig, clientSecret: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your client secret"
              required
            />
            <p className="mt-1 !text-sm text-gray-500">
              The client secret is used to securely authenticate your
              application. Keep this confidential.
            </p>
          </div>

          {disabled && (
            <div className="pt-4">
              <button
                type="button"
                className="w-full bg-blue-600 hover:cursor-pointer text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          )}
        </form>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          API Access Information
        </h3>
        <div className="space-y-2 !text-sm text-gray-600">
          <p className="!text-sm">
            • Your API credentials will be used to authenticate requests to the
            VIP extension API.
          </p>
          <p className="!text-sm">
            • Make sure to keep your client secret secure and never expose it in
            client-side code.
          </p>
          <p className="!text-sm">
            • You can obtain your client ID and secret from the developer
            dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessConfig;
