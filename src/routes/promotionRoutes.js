const express = require("express");
const router = express.Router();
const { getDatabase } = require("../config/database");
const { getUnique6Digit } = require("../utils/helpers");
const { getLatestSession } = require("../services/sessionService");
const axios = require("axios");

/**
 * Create campaign
 */
router.post("/create-campaign", async (req, res, next) => {
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

    const appIds = Array.isArray(applicationIds) ? applicationIds : [applicationIds];

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
    const db = await getDatabase(companyId);
    const collection = db.collection("vip_configs");

    const existingConfig = await collection.findOne({ companyId });
    const userGrpIdMap = existingConfig?.userGrpIds || {};
    const failedApps = [];
    const promotions = {};

    const getProductUIDs = products
      .filter((product) => product && typeof product === "object" && product.uid)
      .map((product) => Number(product.uid))
      .filter((uid) => !isNaN(uid));

    for (const appId of appIds) {
      const groupObj = (userGrpIdMap[appId] || []).find(
        (obj) => obj.name === groupName
      );

      if (!groupObj?.groupId) {
        continue;
      }

      if (type !== "PRODUCT_EXCLUSIVITY") {
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

        try {
          const response = await axios.post(
            `https://api.fynd.com/service/platform/cart/v1.0/company/${companyId}/application/${appId}/promotion`,
            prmotionPayload,
            config
          );

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
      promotions: promotions || {},
      products: products,
      discount: discount || {},
      startDate: startDate,
      endDate: endDate,
      preLaunchDays: preLaunchDays || 0,
      name: name,
      offerText: offerText || "",
      offerLabel: offerLabel || "",
      description: description || "",
      type: groupName,
      createdAt: new Date(),
    };

    const collectionName = db.collection("campaigns");
    await collectionName.insertOne(payload);

    return res.json({
      message: "Campaign configured successfully",
      success: true,
      campaignId: campaignId,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router; 