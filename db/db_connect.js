const { Client } = require('pg');  // Import the PostgreSQL client
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a new PostgreSQL client
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,  // Default port if not specified
});

// Connect to the database
async function connect() {
  try {
    await client.connect();
    console.log('Connected to the database successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.stack);
    process.exit(1);  // Exit the process on connection failure
  }
}

// Run schema creation (schema.sql)
async function runSchema() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
    await client.query(schema);  // Run the schema to create the tables
    console.log('Schema executed successfully.');
  } catch (error) {
    console.error('Error executing schema:', error);
  }
}

// Run data insertion (insert_data.sql)
async function insertData() {
  try {
    const insertDataSQL = fs.readFileSync(path.join(__dirname, 'sql', 'insert_data.sql'), 'utf8');
    await client.query(insertDataSQL);  // Run the insert data queries
    console.log('Data inserted successfully.');
  } catch (error) {
    console.error('Error inserting data:', error);
  }
}

connect();  // Connect to DB

async function syncDatabase() {
  try {
    await runSchema();  // Create tables
    console.log('Schema executed successfully.');
    await insertData(); // Insert initial data
    console.log('Data inserted successfully.');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

syncDatabase();

module.exports = { client };
