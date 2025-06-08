const { setupFdk } = require("@gofynd/fdk-extension-javascript/express");
const { SQLiteStorage } = require("@gofynd/fdk-extension-javascript/express/storage");
const { sqliteInstance } = require("./database");
require("dotenv").config();

/**
 * Configure FDK extension with necessary settings
 * @returns {Object} Configured FDK extension
 */
const configureFdk = () => {
  return setupFdk({
    api_key: process.env.EXTENSION_API_KEY,
    api_secret: process.env.EXTENSION_API_SECRET,
    base_url: process.env.EXTENSION_BASE_URL,
    cluster: process.env.FP_API_DOMAIN,
    callbacks: {
      auth: async (req) => {
        if (req.query.application_id) {
          return `${req.extension.base_url}/company/${req.query["company_id"]}/application/${req.query.application_id}`;
        }
        return `${req.extension.base_url}/company/${req.query["company_id"]}`;
      },
      uninstall: async (req) => {
        // Cleanup data related to extension
        // Process async if task is time-consuming
      },
    },
    storage: new SQLiteStorage(sqliteInstance, "exapmple-fynd-platform-extension"),
    access_mode: "online",
    webhook_config: {
      api_path: "/api/webhook-events",
      notification_email: "karan.desai@devxconsultancy.com",
      event_map: {
        "company/product/delete": {
          handler: (eventName) => {
            console.log(eventName);
          },
          version: "1",
        },
        "application/shipment/create": {
          handler: require("../services/shipmentService").processShipmentEvent,
          version: "1",
        },
      },
    },
  });
};

module.exports = configureFdk; 