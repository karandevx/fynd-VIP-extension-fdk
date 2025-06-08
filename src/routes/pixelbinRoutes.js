const express = require("express");
const router = express.Router();
const multer = require("multer");
const { PixelbinConfig, PixelbinClient } = require("@pixelbin/admin");
require("dotenv").config();

const upload = multer();

// Configure Pixelbin
const config = new PixelbinConfig({
  domain: "https://api.pixelbin.io",
  apiSecret: process.env.PIXELBIN_API_SECRET,
});
const pixelbin = new PixelbinClient(config);

/**
 * Upload file to Pixelbin
 */
router.post("/upload", upload.single("file"), async (req, res) => {
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
      path: "vip-extension",
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

module.exports = router; 