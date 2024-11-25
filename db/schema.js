const fs = require('fs');
const path = require('path');
const { client } = require('./connect');

const runSQLFile = async (filePath) => {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    await client.query(sql);
    console.log(`Executed: ${path.basename(filePath)}`);
  } catch (err) {
    console.error(`Error executing ${path.basename(filePath)}:`, err.message);
  }
};

const createLookupTables = async () => {
  await runSQLFile(path.join(__dirname, './sql/role.sql'));
  await runSQLFile(path.join(__dirname, './sql/application_status.sql'));
};

const createUserTable = async () => {
  await runSQLFile(path.join(__dirname, './sql/user.sql'));
};

const createSessionTable = async () => {
  await runSQLFile(path.join(__dirname, './sql/session.sql'));
};

const createJobPostingTable = async () => {
  await runSQLFile(path.join(__dirname, './sql/job_posting.sql'));
};

const createApplicationTable = async () => {
  await runSQLFile(path.join(__dirname, './sql/application.sql'));
};

const createApplicationScoreTable = async () => {
  await runSQLFile(path.join(__dirname, './sql/application_score.sql'));
};

module.exports = {
  createUserTable,
  createSessionTable,
  createLookupTables,
  createJobPostingTable,
  createApplicationTable,
  createApplicationScoreTable,
};
