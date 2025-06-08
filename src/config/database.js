const sqlite3 = require("sqlite3").verbose();
const { MongoClient } = require("mongodb");
require("dotenv").config();

// SQLite configuration
const sqliteInstance = new sqlite3.Database("session_storage.db");

// MongoDB configuration
const uri = process.env.MONGO_URI;

// MongoDB client instance
let mongoClient = null;

/**
 * Get MongoDB client instance
 * @returns {Promise<MongoClient>} MongoDB client instance
 */
const getMongoClient = async () => {
  if (!mongoClient) {
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
  }
  return mongoClient;
};

/**
 * Get database instance for a specific company
 * @param {string} companyId - Company ID
 * @returns {Promise<Db>} MongoDB database instance
 */
const getDatabase = async (companyId) => {
  const client = await getMongoClient();
  return client.db(`${companyId}_VIP_Program`);
};

module.exports = {
  sqliteInstance,
  getMongoClient,
  getDatabase,
}; 