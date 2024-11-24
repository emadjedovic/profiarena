const queries = {
  // User-related queries
  createUserSQL: `
    INSERT INTO "User" ("first_name", "last_name", "email", "password", "phone", "role_id")
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
  `,
  getUserByIdSQL: `
    SELECT * FROM "User" WHERE id = $1;
  `,
  deleteUserSQL: `
    DELETE FROM "User" WHERE id = $1;
  `,

  // Talent-related queries
  getAllTalentsSQL: `
    SELECT * FROM "User" WHERE role_id = 2;
  `,
  getTalentByIdSQL: `
    SELECT * FROM "User" WHERE role_id = 2 AND id = $1;
  `,
  updateTalentSQL: `
    UPDATE "User"
    SET 
      "first_name" = $1,
      "last_name" = $2,
      "email" = $3,
      "phone" = $4,
      "address" = $5,
      "date_of_birth" = $6,
      "about" = $7,
      "education" = $8,
      "skills" = $9,
      "languages" = $10,
      "socials" = $11,
      "projects" = $12,
      "cv" = $13,
      "certificates" = $14,
      "updated_at" = CURRENT_TIMESTAMP
    WHERE "id" = $15
    RETURNING *;
  `,

  // HR-related queries
  updateHRSQL: `
    UPDATE "User"
    SET "first_name" = $1, "last_name" = $2, "email" = $3, "company_name" = $4
    WHERE "id" = $5;
  `,

  // Job Posting-related queries
  createJobPostingSQL: `
    INSERT INTO "Job_Posting" ("title", "description", "city", "application_deadline", "company", "cv_field", "cover_letter_field", "projects_field", "certificates_field", "hr_id") 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
  `,
  getJobPostingsByHrIdSQL: `
    SELECT * FROM "Job_Posting" WHERE hr_id = $1;
  `,
  getJobPostingByIdSQL: `
    SELECT * FROM "Job_Posting" WHERE id = $1;
  `,
};

module.exports = queries;
