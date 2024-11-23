// db/queries.js

const userQueries = {
  createUser: `
      INSERT INTO "User" ("first_name", "last_name", "email", "password", "phone", "role_id", "company_name")
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `,
  getUserById: `
      SELECT * FROM "User" WHERE id = $1;
    `,
  getAllTalents: `
      SELECT * FROM "User" WHERE role_id = 2;
    `,
  updateUser: `
      UPDATE "User"
      SET "first_name" = $1, "last_name" = $2, "email" = $3, "company_name" = $4
      WHERE "id" = $5;
    `,
  deleteUser: `
      DELETE FROM "User" WHERE id = $1;
    `,
};

const jobPostingQueries = {
  createJobPosting: `INSERT INTO "Job_Posting" ("title", "description", "city", "application_deadline", "company", "cv_field", "cover_letter_field", "projects_field", "certificates_field", "hr_id") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
  getJobPostingsByHrId: `SELECT * FROM "Job_Posting" WHERE hr_id = $1;`,
  getJobPostingById: `SELECT * FROM "Job_Posting" WHERE id=$1;`
};

module.exports = { userQueries, jobPostingQueries };
