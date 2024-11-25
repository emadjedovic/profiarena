const queries = {
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
  deleteCVSQL: `UPDATE "User" SET cv = NULL WHERE id = $1`,
  setCertificatesSQL: `UPDATE "User" SET certificates = $1 WHERE id = $2`,
  setSocialsSQL: `UPDATE "User" SET socials = $1 WHERE id = $2`,

  getAllTalentsSQL: `
    SELECT * FROM "User" WHERE role_id = 2;
  `,
  getUserByEmail: `SELECT * FROM "User" WHERE "email" = $1`,
  getTalentByIdSQL: `
    SELECT * FROM "User" WHERE role_id = 2 AND id = $1;
  `,
  toggleArchiveJobSQL: `UPDATE "Job_Posting" SET "is_archived" = $1 WHERE "id" = $2`,
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

  updateHRSQL: `
    UPDATE "User"
    SET "first_name" = $1, "last_name" = $2, "email" = $3, "company_name" = $4
    WHERE "id" = $5;
  `,
  getAllActiveJobs: `SELECT * FROM "Job_Posting" WHERE is_archived=false`,
  createJobPostingSQL: `
    INSERT INTO "Job_Posting" ("title", "description", "city", "application_deadline", "company", "cv_field", "cover_letter_field", "projects_field", "certificates_field", "hr_id") 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
  `,
  getUserApplications: `SELECT a.id AS application_id,
              a.job_posting_id,
              a.cv,
              a.cover_letter,
              a.projects,
              a.certificates, 
              jp.title AS job_title, 
              as_table.status_desc AS application_status, 
              a.submitted_at
       FROM "Application" AS a
       JOIN "Job_Posting" AS jp ON a.job_posting_id = jp.id
       JOIN "Application_Status" AS as_table ON a.application_status_id = as_table.id
       WHERE a.talent_id = $1`,
  getJobPostingsByHrIdSQL: `
    SELECT * FROM "Job_Posting" WHERE hr_id = $1;
  `,
  getJobPostingByIdSQL: `
    SELECT * FROM "Job_Posting" WHERE id = $1;
  `,
  getApplicationStatusSQL: `SELECT status_table.status_desc FROM "Application_Status" as status_table JOIN "Application" as a ON status_table.id=a.application_status_id WHERE a.job_posting_id=$1 AND a.talent_id = $2`,
  createApplicationSQL: `INSERT INTO "Application" (talent_id, job_posting_id, application_status_id) VALUES ($1, $2, $3) RETURNING id`,
  setApplicationCV:`UPDATE "Application" SET "cv" = $1 WHERE "id" = $2`,
  setApplicationCoverLetter:`UPDATE "Application" SET "cover_letter" = $1 WHERE "id" = $2`,
  setApplicationProjects:`UPDATE "Application" SET "projects" = $1 WHERE "id" = $2`,
  setApplicationCertificates:`UPDATE "Application" SET "certificates" = $1 WHERE "id" = $2`
};

module.exports = queries;
