const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Validates that a required environment variable is set
 * @param {string} name - Name of the environment variable
 * @throws {Error} If the environment variable is not set
 * @returns {string} The value of the environment variable
 */
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Application configuration object
 */
const config = {
  port: requireEnv('PORT'),
  nodeEnv: requireEnv('NODE_ENV'),
  mongoUri: requireEnv('MONGO_URI'),
  hostUrl: requireEnv('HOST_URL'),
};

module.exports = config;
