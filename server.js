const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const serveStatic = require("serve-static");
const { readFileSync } = require("fs");
const cron = require("node-cron");
const moment = require("moment");
const configureFdk = require("./src/config/fdk");
const { getDatabase } = require("./src/config/database");
const { getLatestSession } = require("./src/services/sessionService");

// Import routes
const productRoutes = require("./src/routes/productRoutes");
const salesChannelRoutes = require("./src/routes/salesChannelRoutes");
const pixelbinRoutes = require("./src/routes/pixelbinRoutes");
const promotionRoutes = require("./src/routes/promotionRoutes");

// Initialize express app
const app = express();

// Configure middleware
app.use(cookieParser("ext.session"));
app.use(bodyParser.json({ limit: "2mb" }));

// Configure static file serving
const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "frontend", "public", "dist")
    : path.join(process.cwd(), "frontend");
app.use(serveStatic(STATIC_PATH, { index: false }));

// Configure FDK extension
const fdkExtension = configureFdk();
const platformApiRoutes = fdkExtension.platformApiRoutes;

// Configure cron job for VIP cleanup
cron.schedule("0 0 * * *", async () => {
  try {
    const { company_id } = (await getLatestSession()) || {};
    if (!company_id) return;

    const db = await getDatabase(company_id);
    const users = await db.collection("users").find({ isVIP: true }).toArray();

    console.log("Running VIP cleanup cron job at UTC 12:00 AM");
    const today = moment.utc().startOf("day");

    for (const user of users) {
      let updated = false;

      // Check each type expiry
      [
        "PRODUCT_EXCLUSIVITY",
        "CUSTOM_PROMOTIONS",
        "PRODUCT_EXCLUSIVITY_AND_CUSTOM_PROMOTIONS",
      ].forEach((type) => {
        const expiryField = `${type}_Expiry`;
        if (user[expiryField]) {
          const expiryDate = moment.utc(user[expiryField]).startOf("day");

          if (expiryDate.isSame(today)) {
            user[type] = false;
            user[expiryField] = null;
            updated = true;
          }
        }
      });

      // Update VIP status and days
      const activeTypes = [
        "PRODUCT_EXCLUSIVITY",
        "CUSTOM_PROMOTIONS",
        "PRODUCT_EXCLUSIVITY_AND_CUSTOM_PROMOTIONS",
      ].filter((type) => user[type]);

      if (activeTypes.length === 0) {
        user.isVIP = false;
        user.VIPDays = 0;
        updated = true;
      } else {
        const futureExpiries = activeTypes.map((type) =>
          moment.utc(user[`${type}_Expiry`]).endOf("day")
        );

        const maxExpiry = moment.max(futureExpiries);
        const remainingDays = maxExpiry.diff(today, "days");
        user.VIPDays = remainingDays >= 0 ? remainingDays : 0;
        updated = true;
      }

      if (updated) {
        await user.save();
        console.log(`Updated user ${user._id}`);
      }
    }

    console.log("VIP cleanup cron job completed.");
  } catch (error) {
    console.error("Error running VIP cleanup cron job:", error);
  }
});

// Configure routes
app.use("/", fdkExtension.fdkHandler);

// Webhook event handler
app.post("/api/webhook-events", async (req, res) => {
  try {
    console.log("Webhook Event received");
    console.log(JSON.stringify(req.body.event, null, 2));
    await fdkExtension.webhookRegistry.processWebhook(req);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.log("Error Processing Webhook");
    console.log(JSON.stringify(req.body.event, null, 2));
    return res.status(500).json({ success: false });
  }
});

// API routes
platformApiRoutes.use("/products", productRoutes);
platformApiRoutes.use("/sales", salesChannelRoutes);
platformApiRoutes.use("/pixelbin", pixelbinRoutes);
platformApiRoutes.use("/promotion", promotionRoutes);
app.use("/api", platformApiRoutes);

// Serve React app for all other routes
app.get("*", (req, res) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(path.join(STATIC_PATH, "index.html")));
});

module.exports = app;
