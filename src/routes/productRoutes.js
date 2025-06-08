const express = require("express");
const router = express.Router();
const { getDatabase } = require("../config/database");

/**
 * Get all products
 */
router.get("/", async (req, res, next) => {
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

/**
 * Get VIP products
 */
router.get("/vip-products", async (req, res, next) => {
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

/**
 * Save VIP products
 */
router.post("/vip-products", async (req, res, next) => {
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

    const db = await getDatabase(companyId);
    const collection = db.collection("vip_configs");

    const update = {
      $set: {
        vipProducts: selectedProducts,
        updatedAt: new Date(),
      },
    };

    await collection.updateOne({ companyId }, update, { upsert: true });

    return res.json({
      success: true,
      message: "VIP products saved successfully",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get products for application
 */
router.get("/application/:application_id", async (req, res, next) => {
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
});

module.exports = router; 