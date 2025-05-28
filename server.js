const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const serveStatic = require("serve-static");
const { readFileSync } = require('fs');
const { setupFdk } = require("@gofynd/fdk-extension-javascript/express");
const { SQLiteStorage } = require("@gofynd/fdk-extension-javascript/express/storage");
const { PixelbinConfig, PixelbinClient } = require("@pixelbin/admin");
const sqliteInstance = new sqlite3.Database('session_storage.db');
const productRouter = express.Router();
const pixelBinRouter = express.Router();
const fs = require("fs");
const multer = require('multer');
const upload = multer();
require('dotenv').config();



const fdkExtension = setupFdk({
    api_key: process.env.EXTENSION_API_KEY,
    api_secret: process.env.EXTENSION_API_SECRET,
    base_url: process.env.EXTENSION_BASE_URL,
    cluster: process.env.FP_API_DOMAIN,
    callbacks: {
        auth: async (req) => {
            // Write you code here to return initial launch url after auth process complete
            if (req.query.application_id)
                return `${req.extension.base_url}/company/${req.query['company_id']}/application/${req.query.application_id}`;
            else
                return `${req.extension.base_url}/company/${req.query['company_id']}`;
        },
        
        uninstall: async (req) => {
            // Write your code here to cleanup data related to extension
            // If task is time taking then process it async on other process.
        }
    },
    storage: new SQLiteStorage(sqliteInstance,"exapmple-fynd-platform-extension"), // add your prefix
    access_mode: "online",
    webhook_config: {
        api_path: "/api/webhook-events",
        notification_email: "useremail@example.com",
        event_map: {
            "company/product/delete": {
                "handler": (eventName) => {  console.log(eventName)},
                "version": '1'
            }
        }
    },
});

const config = new PixelbinConfig({
  domain: "https://api.pixelbin.io",
  apiSecret: process.env.PIXELBIN_API_SECRET,
});

const pixelbin = new PixelbinClient(config);

const STATIC_PATH = process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'frontend', 'public' , 'dist')
    : path.join(process.cwd(), 'frontend');
    
const app = express();
const platformApiRoutes = fdkExtension.platformApiRoutes;

// Middleware to parse cookies with a secret key
app.use(cookieParser("ext.session"));

// Middleware to parse JSON bodies with a size limit of 2mb
app.use(bodyParser.json({
    limit: '2mb'
}));

// Serve static files from the React dist directory
app.use(serveStatic(STATIC_PATH, { index: false }));

// FDK extension handler and API routes (extension launch routes)
app.use("/", fdkExtension.fdkHandler);

// Route to handle webhook events and process it.
app.post('/api/webhook-events', async function(req, res) {
    try {
      console.log(`Webhook Event: ${req.body.event} received`)
      await fdkExtension.webhookRegistry.processWebhook(req);
      return res.status(200).json({"success": true});
    } catch(err) {
      console.log(`Error Processing ${req.body.event} Webhook`);
      return res.status(500).json({"success": false});
    }
})

productRouter.get('/', async function view(req, res, next) {
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
          (product) => !(product?.tags || []).includes('vip_product')
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
  
productRouter.get('/vip-products', async function view(req, res, next) {
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
          tags: ['vip_product'],
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
  
// Get products list for application
productRouter.get('/application/:application_id', async function view(req, res, next) {
    try {
        const {
            platformClient
        } = req;
        const { application_id } = req?.params;
        const data = await platformClient?.application(application_id)?.catalog?.getAppProducts()
        return res?.json(data);
    } catch (err) {
        next(err);
    }
});

pixelBinRouter.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const { originalname, buffer } = req.file;
    const ext = originalname.split('.').pop();
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
      }
    });
    res.status(200).json({ success: true, url: result.url, result });
  } catch (error) {
    console.error('Error uploading to Pixelbin:', error);
    res.status(500).json({ success: false, message: 'Failed to upload to Pixelbin' });
  }
});

// FDK extension api route which has auth middleware and FDK client instance attached to it.
platformApiRoutes.use('/products', productRouter);
platformApiRoutes.use('/pixelbin', pixelBinRouter);

// If you are adding routes outside of the /api path, 
// remember to also add a proxy rule for them in /frontend/vite.config.js
app.use('/api', platformApiRoutes);

// Serve the React app for all other routes
app.get('*', (req, res) => {
    return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(path.join(STATIC_PATH, "index.html")));
});



module.exports = app;
