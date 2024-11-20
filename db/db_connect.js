const dotenv = require("dotenv");
dotenv.config(); // Load environment variables

const { Pool } = require('pg'); // Import the Pool class from the pg module

// Create a new pool instance directly using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

// Export the pool to be used in other parts of your application
module.exports = pool;

