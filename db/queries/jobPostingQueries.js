const jobPostingQueries = {
  getJobPostingsByHrIdSQL: `
    SELECT * FROM "Job_Posting" WHERE hr_id = $1
  `,
  getJobPostingByIdSQL: `
    SELECT * FROM "Job_Posting" WHERE id = $1
  `,

  toggleArchiveJobSQL: `UPDATE "Job_Posting" SET "is_archived" = $1 WHERE "id" = $2`,

  createJobPostingSQL: `
    INSERT INTO "Job_Posting" ("title", "description", "city", "application_deadline", "company", "cv_field", "cover_letter_field", "projects_field", "certificates_field", "hr_id") 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `,
  getAllActiveJobsSQL: `SELECT * FROM "Job_Posting" WHERE is_archived=false`,
};

module.exports = jobPostingQueries;
