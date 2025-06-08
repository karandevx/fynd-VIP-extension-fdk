const { getDatabase } = require("../config/database");
const { extractUserInfo, getVIPDaysFromTags, getVIPExpiryDate, getPromoAndCodeIds } = require("../utils/helpers");
const { getLatestSession } = require("./sessionService");
const axios = require("axios");

/**
 * Process shipment event
 * @param {string} eventName - Event name
 * @param {Object} body - Event body
 * @param {string} companyId - Company ID
 * @param {string} applicationId - Application ID
 */
const processShipmentEvent = async (eventName, body, companyId, applicationId) => {
  console.log("Processing Shipment Event", body);

  const shipment = body?.payload?.shipment;
  if (!shipment) return console.log("No shipment data found");

  const vipItem = shipment?.bags?.find((bag) =>
    bag?.item?.meta?.tags?.includes("vip_product")
  );

  const vipItemId = vipItem?.item?.id;
  const VIPDays = getVIPDaysFromTags(shipment?.bags);
  const userInfo = extractUserInfo(shipment);

  if (vipItemId) {
    await processVIPItem(vipItemId, userInfo, companyId, applicationId, shipment);
  }

  await processPromotions(shipment, userInfo, companyId, applicationId);
};

/**
 * Process VIP item
 * @param {string} vipItemId - VIP item ID
 * @param {Object} userInfo - User information
 * @param {string} companyId - Company ID
 * @param {string} applicationId - Application ID
 * @param {Object} shipment - Shipment data
 */
const processVIPItem = async (vipItemId, userInfo, companyId, applicationId, shipment) => {
  const db = await getDatabase(companyId);
  const vipConfig = await db.collection("vip_configs").findOne({ companyId });

  const type = getPlanKey(vipConfig, applicationId, vipItemId);
  const userPayload = {
    ...userInfo,
    companyId: companyId.toString(),
    orderId: shipment?.order_id || "",
    applicationId,
    createdAt: new Date(shipment?.order_created),
    VIPDays,
    [`${type}_Expiry`]: getVIPExpiryDate(shipment?.order_created, VIPDays),
    isVIP: true,
    [type]: true,
    updatedAt: new Date(),
  };

  await upsertUser(userPayload, companyId);
  await updateUserAttrDefinition(vipConfig, userInfo.userId, companyId, applicationId, vipItemId);
};

/**
 * Process promotions
 * @param {Object} shipment - Shipment data
 * @param {Object} userInfo - User information
 * @param {string} companyId - Company ID
 * @param {string} applicationId - Application ID
 */
const processPromotions = async (shipment, userInfo, companyId, applicationId) => {
  const promoAndCodeIds = getPromoAndCodeIds(shipment?.bags);
  const hasAnyPromoId = promoAndCodeIds.length > 0;

  const db = await getDatabase(companyId);
  const vipConfig = await db.collection("vip_configs").findOne({
    startDate: { $lte: new Date().toISOString() },
    endDate: { $gt: new Date().toISOString() },
    applicationIds: applicationId,
  });

  if (!vipConfig?.promotions?.[applicationId]) {
    console.log("No matching promotions found");
    return;
  }

  const campaignId = vipConfig.campaignId;
  const isPromoMatched = promoAndCodeIds.includes(vipConfig.promotions[applicationId]);

  if (isPromoMatched && hasAnyPromoId) {
    const analyticsPayload = {
      ...userInfo,
      companyId: companyId.toString(),
      applicationId,
      orderId: shipment?.order_id,
      createdAt: shipment?.bags?.[0]?.order_created || "",
      campaignId,
      promotionId: vipConfig.promotions[applicationId],
      promotionType: vipConfig.type || "",
    };

    await db.collection("analytics").insertOne(analyticsPayload);
    console.log("Promo analytics saved");
  } else {
    console.log("No promo match found in shipment data");
  }
};

/**
 * Get plan key from VIP config
 * @param {Object} data - VIP config data
 * @param {string} applicationId - Application ID
 * @param {string} itemCode - Item code
 * @returns {string} Plan key
 */
const getPlanKey = (data, applicationId, itemCode) => {
  const matchedVip = data.vipProducts.find((productObj) => {
    const key = Object.keys(productObj)[0];
    return productObj[key].uid === itemCode;
  });

  if (!matchedVip) {
    console.log("No VIP product found with this item code.");
    return null;
  }

  return Object.keys(matchedVip)[0];
};

/**
 * Update user attribute definition
 * @param {Object} vipConfig - VIP config
 * @param {string} userId - User ID
 * @param {string} companyId - Company ID
 * @param {string} applicationId - Application ID
 * @param {string} itemCode - Item code
 */
const updateUserAttrDefinition = async (vipConfig, userId, companyId, applicationId, itemCode) => {
  try {
    const result = getUserGroupByItemCodeAndAppId(vipConfig, applicationId, itemCode);
    const userAttributeId = result?.attributeId;

    if (!userAttributeId) {
      console.log(`No user attribute definition found for app ${applicationId}`);
      return;
    }

    const { access_token: AUTH_TOKEN } = await getLatestSession();
    const config = {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const payload = {
      type: "boolean",
      attribute: { value: true },
    };

    const url = `https://api.fynd.com/service/platform/user/v1.0/company/${companyId}/application/${applicationId}/user_attribute/definition/${userAttributeId}/user/${userId}`;
    const response = await axios.put(url, payload, config);
    console.log("Attribute update response:", response?.data);
  } catch (error) {
    console.error("Error updating user attribute:", error?.message || error);
  }
};

/**
 * Get user group by item code and application ID
 * @param {Object} data - VIP config data
 * @param {string} applicationId - Application ID
 * @param {string} itemCode - Item code
 * @returns {Object} User group
 */
const getUserGroupByItemCodeAndAppId = (data, applicationId, itemCode) => {
  const matchedVip = data.vipProducts.find((productObj) => {
    const key = Object.keys(productObj)[0];
    return productObj[key].uid === itemCode;
  });

  if (!matchedVip) {
    console.log("No VIP product found with this item code.");
    return null;
  }

  const benefitKey = Object.keys(matchedVip)[0];
  const userGroups = data.userAttributeIds?.[applicationId];

  if (!userGroups || userGroups.length === 0) {
    console.log("No user group found for this application ID.");
    return null;
  }

  return userGroups.find((group) => group.name.includes(benefitKey));
};

/**
 * Upsert user
 * @param {Object} payload - User payload
 * @param {string} companyId - Company ID
 */
const upsertUser = async (payload, companyId) => {
  const db = await getDatabase(companyId);
  try {
    const result = await db
      .collection("users")
      .updateOne(
        { userId: payload.userId },
        { $set: payload },
        { upsert: true }
      );
    console.log(`Upserted ${result.upsertedCount} document(s)`);
  } catch (err) {
    console.error("MongoDB upsert error:", err);
  }
};

module.exports = {
  processShipmentEvent,
  getPlanKey,
  getUserGroupByItemCodeAndAppId,
}; 