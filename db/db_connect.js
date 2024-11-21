const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Create a new Sequelize instance with your PostgreSQL connection details
const sequelize = new Sequelize(
  process.env.DB_DATABASE,    // Database name
  process.env.DB_USER,        // Database username
  process.env.DB_PASSWORD,    // Database password
  {
    host: process.env.DB_HOST, // Database host
    port: process.env.DB_PORT, // Database port (optional, defaults to 5432)
    dialect: "postgres",       // Specify the database dialect
    logging: false,            // Disable logging for cleaner output
  }
);

// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to the database has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = sequelize;
