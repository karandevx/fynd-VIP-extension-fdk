const express = require("express");
const router = express.Router();
const { getDatabase } = require("../config/database");
const { getLatestSession } = require("../services/sessionService");
const axios = require("axios");

/**
 * Get all sales channels
 */
router.get("/", async (req, res, next) => {
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

/**
 * Configure plans for sales channels
 */
router.post("/configure-plans", async (req, res, next) => {
  try {
    const { platformClient } = req;
    const recentSession = await getLatestSession();
    const { salesChannels: applicationIds, configuredPlans } = req.body;
    const { access_token: AUTH_TOKEN } = recentSession || {};

    const appIds = Array.isArray(applicationIds) ? applicationIds : [applicationIds];
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
    const db = await getDatabase(companyId);
    const collection = db.collection("vip_configs");

    const existingConfig = await collection.findOne({ companyId });

    const userAttributesMap = existingConfig?.userAttributeIds || {};
    const userGrpIdMap = existingConfig?.userGrpIds || {};
    const existingAppIds = new Set(Object.keys(existingConfig?.applicationIds));
    const existingPlansMap = {};

    // Build a quick lookup of existing plan slugs per appId
    for (const appId of existingAppIds) {
      existingPlansMap[appId] = new Set(
        (userAttributesMap[appId] || []).map((attr) => attr.name)
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

    await collection.updateOne({ companyId }, update, { upsert: true });

    return res.json({
      message: "Plans configured successfully",
      success: true,
      failedApps,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router; 