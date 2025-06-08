const moment = require("moment");

/**
 * Get a unique 6-digit number
 * @returns {number} Unique 6-digit number
 */
const getUnique6Digit = () => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(10 + Math.random() * 90);
  return Number(timestamp + random);
};

/**
 * Extract user information from shipment data
 * @param {Object} shipment - Shipment data
 * @returns {Object} User information
 */
const extractUserInfo = (shipment) => {
  const isAnonymous = shipment?.is_anonymous_user ?? true;
  const name = shipment?.delivery_address?.name || "";
  const [first, last] = name?.includes(" ") ? name.split(" ") : [name, name];

  return {
    userId: shipment?.user?.user_oid,
    firstName: isAnonymous ? first : shipment?.user?.first_name,
    lastName: isAnonymous ? last || first : shipment?.user?.last_name,
    email: isAnonymous
      ? shipment?.delivery_address?.email
      : shipment?.user?.email,
    phone: `${shipment?.delivery_address?.country_phone_code ?? ""}${
      shipment?.delivery_address?.phone ?? ""
    }`,
  };
};

/**
 * Get VIP days from tags
 * @param {Array} bags - Array of bags
 * @returns {number} Number of VIP days
 */
const getVIPDaysFromTags = (bags) =>
  bags
    ?.flatMap((bag) => bag?.item?.meta?.tags || [])
    .find((tag) => /(\d+)_days$/.test(tag))
    ?.match(/(\d+)_days$/)?.[1] || 0;

/**
 * Get VIP expiry date
 * @param {string} orderDate - Order date
 * @param {number} VIPDays - Number of VIP days
 * @returns {Date} Expiry date
 */
const getVIPExpiryDate = (orderDate, VIPDays) =>
  new Date(new Date(orderDate).getTime() + VIPDays * 86400000);

/**
 * Get promo and code IDs from bags
 * @param {Array} bags - Array of bags
 * @returns {Array} Array of promo and code IDs
 */
const getPromoAndCodeIds = (bags) =>
  bags
    ?.flatMap((bag) =>
      bag?.applied_promos?.flatMap((promo) => [promo?.promo_id, promo?.code_id])
    )
    .filter(Boolean) || [];

module.exports = {
  getUnique6Digit,
  extractUserInfo,
  getVIPDaysFromTags,
  getVIPExpiryDate,
  getPromoAndCodeIds,
}; 