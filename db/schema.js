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

const createTables = async () => {
  const sqlFiles = [
    'session.sql',
    'role.sql',
    'application_status.sql',
    'interview_status.sql',
    'user.sql',
    'job_posting.sql',
    'application.sql',
    'application_score.sql',
    'interview_schedule.sql',
    'email_communication.sql',
  ];

  for (const file of sqlFiles) {
    await runSQLFile(path.join(__dirname, './sql', file));
  }
};

module.exports = {
  createTables
};
