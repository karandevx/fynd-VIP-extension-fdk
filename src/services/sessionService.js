const { sqliteInstance } = require("../config/database");

/**
 * Get the latest session from SQLite database
 * @returns {Promise<Object>} Latest session data
 */
const getLatestSession = async () => {
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
};

module.exports = {
  getLatestSession,
}; 