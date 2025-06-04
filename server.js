const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const serveStatic = require("serve-static");
const { readFileSync } = require("fs");
const { setupFdk } = require("@gofynd/fdk-extension-javascript/express");
const {
  SQLiteStorage,
} = require("@gofynd/fdk-extension-javascript/express/storage");
const { PixelbinConfig, PixelbinClient } = require("@pixelbin/admin");
const sqliteInstance = new sqlite3.Database("session_storage.db");
const productRouter = express.Router();
const salesChannelRouter = express.Router();
const promotionRouter = express.Router();
const pixelBinRouter = express.Router();
const fs = require("fs");
const multer = require("multer");
const upload = multer();
require("dotenv").config();
const axios = require("axios");
const { MongoClient } = require("mongodb");
const { type } = require("os");

const uri =
  "mongodb+srv://karandesai:karandevx@cluster0.snxaomy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const fdkExtension = setupFdk({
  api_key: process.env.EXTENSION_API_KEY,
  api_secret: process.env.EXTENSION_API_SECRET,
  base_url: process.env.EXTENSION_BASE_URL,
  cluster: process.env.FP_API_DOMAIN,
  callbacks: {
    auth: async (req) => {
      // Write you code here to return initial launch url after auth process complete
      if (req.query.application_id)
        return `${req.extension.base_url}/company/${req.query["company_id"]}/application/${req.query.application_id}`;
      else
        return `${req.extension.base_url}/company/${req.query["company_id"]}`;
    },

    uninstall: async (req) => {
      // Write your code here to cleanup data related to extension
      // If task is time taking then process it async on other process.
    },
  },
  storage: new SQLiteStorage(
    sqliteInstance,
    "exapmple-fynd-platform-extension"
  ), // add your prefix
  access_mode: "online",
  webhook_config: {
    api_path: "/api/webhook-events",
    notification_email: "useremail@example.com",
    event_map: {
      "company/product/delete": {
        handler: (eventName) => {
          console.log(eventName);
        },
        version: "1",
      },
      "application/order/placed": {
        handler: (eventName) => {
          console.log(eventName);
        },
        version: "1",
      },
    },
  },
});

const config = new PixelbinConfig({
  domain: "https://api.pixelbin.io",
  apiSecret: process.env.PIXELBIN_API_SECRET,
});

const pixelbin = new PixelbinClient(config);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "frontend", "public", "dist")
    : path.join(process.cwd(), "frontend");

const app = express();
const platformApiRoutes = fdkExtension.platformApiRoutes;

// Middleware to parse cookies with a secret key
app.use(cookieParser("ext.session"));

// Middleware to parse JSON bodies with a size limit of 2mb
app.use(
  bodyParser.json({
    limit: "2mb",
  })
);

// Serve static files from the React dist directory
app.use(serveStatic(STATIC_PATH, { index: false }));

// FDK extension handler and API routes (extension launch routes)
app.use("/", fdkExtension.fdkHandler);

// Route to handle webhook events and process it.
app.post("/api/webhook-events", async function (req, res) {
  try {
    console.log(`Webhook Event: ${req.body.event} received`);
    await fdkExtension.webhookRegistry.processWebhook(req);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.log(`Error Processing ${req.body.event} Webhook`);
    return res.status(500).json({ success: false });
  }
});

productRouter.get("/", async function view(req, res, next) {
  try {
    const { platformClient } = req;

    let allProducts = [];
    let pageNo = 1;
    const pageSize = 50;
    let hasNextPage = true;

    while (hasNextPage) {
      const data = await platformClient.catalog.getProducts({
        pageNo,
        pageSize,
      });

      const items = data?.items || [];

      // Filter out products that have the tag 'vip_product'
      const filtered = items.filter(
        (product) => !(product?.tags || []).includes("vip_product")
      );

      allProducts = allProducts.concat(filtered);

      const pageInfo = data?.page || {};
      hasNextPage = pageInfo?.has_next === true;
      pageNo++;
    }

    return res.json({
      total: allProducts.length,
      items: allProducts,
    });
  } catch (err) {
    next(err);
  }
});

productRouter.get("/vip-products", async function view(req, res, next) {
  try {
    const { platformClient } = req;

    let allVipProducts = [];
    let pageNo = 1;
    const pageSize = 50;
    let hasNextPage = true;

    while (hasNextPage) {
      const data = await platformClient.catalog.getProducts({
        pageNo,
        pageSize,
        tags: ["vip_product"],
      });

      const items = data?.items || [];
      allVipProducts = allVipProducts.concat(items);

      const pageInfo = data?.page || {};
      hasNextPage = pageInfo?.has_next === true;
      pageNo++;
    }

    return res.json({
      total: allVipProducts.length,
      items: allVipProducts,
    });
  } catch (err) {
    next(err);
  }
});
function getUnique6Digit() {
  const timestamp = Date.now().toString().slice(-4); // last 4 digits of timestamp
  const random = Math.floor(10 + Math.random() * 90); // 2-digit random number
  return Number(timestamp + random); // e.g., '348212' as number
}
productRouter.post("/vip-products", async function view(req, res, next) {
  try {
    const { platformClient } = req;
    const companyId = platformClient?.config?.companyId;
    const { selectedProducts } = req.body;
    if (!selectedProducts || !Array.isArray(selectedProducts)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing selectedProducts array",
      });
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(`${companyId}_VIP_Program`);
    const collection = db.collection("vip_configs");

    const update = {
      $set: {
        vipProducts: selectedProducts,
        updatedAt: new Date(),
      },
    };

    const dbResponse = await collection.updateOne({ companyId }, update, {
      upsert: true,
    });
    await client.close();

    return res.json({
      success: true,
      message: "VIP products saved successfully",
    });
  } catch (err) {
    next(err);
  }
});
// Get products list for application
productRouter.get(
  "/application/:application_id",
  async function view(req, res, next) {
    try {
      const { platformClient } = req;
      const { application_id } = req?.params;
      const data = await platformClient
        ?.application(application_id)
        ?.catalog?.getAppProducts();
      return res?.json(data);
    } catch (err) {
      next(err);
    }
  }
);

pixelBinRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    const { originalname, buffer } = req.file;
    const ext = originalname.split(".").pop();
    const baseName = originalname.replace(/\.[^/.]+$/, "");
    const uniqueName = `${baseName}-${Date.now()}`;
    const result = await pixelbin.uploader.upload({
      file: buffer,
      name: uniqueName,
      path: "vip-extension", // or any folder you want
      format: ext,
      tags: [],
      metadata: {},
      overwrite: false,
      filenameOverride: false,
      access: "public-read",
      uploadOptions: {
        chunkSize: 2 * 1024 * 1024,
        concurrency: 2,
        maxRetries: 1,
        exponentialFactor: 1,
      },
    });
    res.status(200).json({ success: true, url: result.url, result });
  } catch (error) {
    console.error("Error uploading to Pixelbin:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to upload to Pixelbin" });
  }
});

salesChannelRouter.get("/", async function view(req, res, next) {
  try {
    const { platformClient } = req;

    let pageNo = 1;
    const pageSize = 50;

    const data = await platformClient.configuration.getApplications({
      pageNo,
      pageSize,
    });

    const items = data?.items || [];

    return res.json({
      total: items.length,
      items: items,
    });
  } catch (err) {
    next(err);
  }
});
function getLatestSession() {
  return new Promise((resolve, reject) => {
    sqliteInstance.all("SELECT * FROM storage", [], (err, rows) => {
      if (err) {
        console.error("Error querying sessions:", err.message);
        return reject(err);
      }

      const latestSession = rows.reduce((latest, current) => {
        return current.ttl > (latest?.ttl || 0) ? current : latest;
      }, null);

      try {
        const session = JSON.parse(latestSession.value);
        resolve(session);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}
salesChannelRouter.post(
  "/configure-plans",
  async function view(req, res, next) {
    try {
      const { platformClient } = req;
      const recentSession = await getLatestSession();
      const { salesChannels: applicationIds, configuredPlans } = req.body;
      const { access_token: AUTH_TOKEN } = recentSession || {};

      const appIds = Array.isArray(applicationIds)
        ? applicationIds
        : [applicationIds];
      const enabledPlans = configuredPlans?.filter((plan) => plan.isEnabled);

      if (!enabledPlans?.length) {
        return res.status(400).json({
          success: false,
          message: "No plans enabled for configuration",
        });
      }

      const config = {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      };

      const companyId = platformClient?.config?.companyId;
      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db(`${companyId}_VIP_Program`);
      const collection = db.collection("vip_configs");

      const existingConfig = await collection.findOne({ companyId });

      const userAttributesMap = existingConfig?.userAttributeIds || {};
      const userGrpIdMap = existingConfig?.userGrpIds || {};
      const existingAppIds = new Set(
        Object.keys(existingConfig?.applicationIds)
      );
      const existingPlansMap = {}; // appId -> plan titles

      // Build a quick lookup of existing plan slugs per appId
      for (const appId of existingAppIds) {
        existingPlansMap[appId] = new Set(
          (userAttributesMap[appId] || []).map((attr) =>
            attr.name.toLowerCase().replace(/ /g, "_")
          )
        );
      }

      const failedApps = [];

      for (const appId of appIds) {
        userAttributesMap[appId] = userAttributesMap[appId] || [];
        userGrpIdMap[appId] = userGrpIdMap[appId] || [];

        const existingPlanSlugs = existingPlansMap[appId] || new Set();

        for (const plan of enabledPlans) {
          const planSlug = plan.title.toLowerCase();
          if (existingPlanSlugs.has(planSlug)) {
            console.log(
              `Plan '${plan.title}' already exists for app ${appId}, skipping...`
            );
            continue;
          }

          const userAttrInput = {
            name: plan.title
              .replace(/_/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            slug: planSlug,
            type: "boolean",
            description: `User attribute for ${plan.title
              .replace(/_/g, " ")
              .toLowerCase()}`,
            customer_editable: false,
            encrypted: false,
          };

          try {
            const response = await axios.post(
              `https://api.fynd.com/service/platform/user/v1.0/company/${companyId}/application/${appId}/user_attribute/definition`,
              userAttrInput,
              config
            );

            const attrId = response?.data?._id;
            userAttributesMap[appId].push({
              attributeId: attrId,
              name: userAttrInput.name,
            });

            const userGrp = {
              name: `${userAttrInput.name} Users`,
              description: `${userAttrInput.name} Users Group`,
              type: "conditional",
              conditions: [
                {
                  user_attribute_definition_id: attrId,
                  value: true,
                  type: "eq",
                },
              ],
            };

            const grpIdRes = await axios.post(
              `https://api.fynd.com/service/platform/user/v1.0/company/${companyId}/application/${appId}/user_group`,
              userGrp,
              config
            );

            const grpId = grpIdRes?.data?.uid;
            userGrpIdMap[appId].push({ groupId: grpId, name: userGrp.name });
          } catch (err) {
            console.error(
              `Failed for app ${appId} and plan ${plan.title}:`,
              err?.message || err
            );
            failedApps.push({ appId, plan: plan.title });
          }
        }
      }

      // Merge configured plans (avoid duplicates)
      const updatedPlans = [
        ...(existingConfig?.benefits || []),
        ...configuredPlans.filter(
          (plan) =>
            !(existingConfig?.benefits || []).some(
              (p) => p.title === plan.title
            )
        ),
      ];

      const update = {
        $set: {
          companyId,
          benefits: updatedPlans,
          applicationIds: [
            ...new Set([...(existingConfig?.applicationIds || []), ...appIds]),
          ],
          userAttributeIds: userAttributesMap,
          userGrpIds: userGrpIdMap,
          updatedAt: new Date(),
          createdAt: existingConfig?.createdAt || new Date(),
        },
      };

      const dbResponse = await collection.updateOne({ companyId }, update, {
        upsert: true,
      });
      await client.close();

      return res.json({
        message: "Plans configured successfully",
        success: true,
        failedApps,
      });
    } catch (err) {
      next(err);
    }
  }
);
promotionRouter.post("/create-campaign", async function view(req, res, next) {
  try {
    const { platformClient } = req;
    const recentSession = await getLatestSession();
    const { access_token: AUTH_TOKEN } = recentSession || {};
    const { payload: campaignPayload } = req.body;
    const {
      applicationIds = [],
      products = [],
      isFreeShipping = false,
      discount = {},
      startDate,
      endDate,
      preLaunchDays = 0,
      name,
      description,
      offerText,
      offerLabel,
      type: groupName,
    } = campaignPayload;

    const appIds = Array.isArray(applicationIds)
      ? applicationIds
      : [applicationIds];

    if (!appIds) {
      return res.status(400).json({
        success: false,
        message: "No appIds",
      });
    }
    const config = {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const companyId = platformClient?.config?.companyId;
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(`${companyId}_VIP_Program`);
    const collection = db.collection("vip_configs");

    const existingConfig = await collection.findOne({ companyId });

    const userGrpIdMap = existingConfig?.userGrpIds || {};

    const failedApps = [];
    const promotions = {};
    console.log("userGrpIdMap", userGrpIdMap);

    const getProductUIDs = products
      .filter(
        (product) => product && typeof product === "object" && product.uid
      )
      .map((product) => Number(product.uid))
      .filter((uid) => !isNaN(uid));

    for (const appId of appIds) {
      const groupObj = (userGrpIdMap[appId] || []).find(
        (obj) => obj.name === groupName
      );
      console.log("groupObj", groupObj?.groupId);
      if (!groupObj?.groupId) {
        continue; // Skip if no group found for this appId
      } else {
        const prmotionPayload = {
          buy_rules: {
            "rule#1": {
              item_id: getProductUIDs,
            },
          },
          is_processed: true,
          auto_apply: true,
          discount_rules: [
            {
              discount_type: discount?.type,
              offer: {
                ...(discount?.type === "percentage" && {
                  discount_percentage: discount?.value,
                }),
                ...(discount?.type === "amount" && {
                  discount_amount: discount?.value,
                }),
              },
              buy_condition: "( rule#1 )",
              item_criteria: {
                item_id: getProductUIDs,
              },
              buying_conditions_arr: [["rule#1"]],
            },
          ],
          apply_exclusive: "cart",
          apply_all_discount: false,
          stackable: true,
          promo_group: "product",
          apply_priority: 1,
          mode: "promotion",
          visiblility: {
            coupon_list: false,
            pdp: true,
          },
          restrictions: {
            uses: {
              remaining: {
                user: 0,
                total: 0,
              },
              maximum: {
                user: 0,
                total: 0,
              },
            },
            post_order: {
              return_allowed: true,
              cancellation_allowed: true,
            },
            platforms: ["web", "android", "ios"],
            user_groups: [groupObj?.groupId],
            user_id: [],
            payments: {},
            user_registered: {
              start: null,
              end: null,
            },
            ordering_stores: [],
            user_type: "user_group",
            email_domain: [],
          },
          post_order_action: {
            action_type: null,
            action_date: null,
          },
          display_meta: {
            name: name,
            description: description,
            offer_text: offerText,
            offer_label: offerLabel,
          },
          reason: null,
          promotion_type: discount?.type,
          application_id: appId,
          _custom_json: {},
          _schedule: {
            start: startDate,
            end: endDate,
            cron: null,
            duration: 0,
            published: true,
            status: "approved",
          },
          ownership: {
            payable_category: "seller",
            payable_by: null,
          },
          calculate_on: "esp",
        };
        console.log("prmotionPayload", prmotionPayload);
        try {
          const response = await axios.post(
            `https://api.fynd.com/service/platform/cart/v1.0/company/${companyId}/application/${appId}/promotion`,
            prmotionPayload,
            config
          );
          console.log("response", response);

          promotions[appId] = response?.data?._id;
        } catch (err) {
          console.error(`Failed for app ${appId}:`, err?.message || err);
          failedApps.push({ appId });
        }
      }
    }
    const campaignId = getUnique6Digit();

    const payload = {
      campaignId: campaignId,
      companyId: companyId,
      applicationIds: appIds,
      promotions: promotions,
      products: products,
      isFreeShipping: isFreeShipping,
      discount: discount,
      startDate: startDate,
      endDate: endDate,
      preLaunchDays: preLaunchDays,
      name: name,
      offerText: offerText,
      offerLabel: offerLabel,
      description: description,
      type: groupName,
      createdAt: new Date(),
    };
    const collectionName = db.collection("campaigns");
    const dbResponse = await collectionName.insertOne(payload);
    await client.close();

    return res.json({
      message: "Campaign configured successfully",
      success: true,
      campaignId: campaignId,
    });
  } catch (err) {
    next(err);
  }
});
// FDK extension api route which has auth middleware and FDK client instance attached to it.
platformApiRoutes.use("/products", productRouter);
platformApiRoutes.use("/sales", salesChannelRouter);
platformApiRoutes.use("/pixelbin", pixelBinRouter);
platformApiRoutes.use("/promotion", promotionRouter);

// If you are adding routes outside of the /api path,
// remember to also add a proxy rule for them in /frontend/vite.config.js
app.use("/api", platformApiRoutes);

// Serve the React app for all other routes
app.get("*", (req, res) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(path.join(STATIC_PATH, "index.html")));
});

module.exports = app;
