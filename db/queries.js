const queries = {
  createUserSQL: `
    INSERT INTO "User" ("first_name", "last_name", "email", "password", "phone", "role_id")
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
  `,
  getUserByIdSQL: `
    SELECT * FROM "User" WHERE id = $1
  `,
  deleteUserSQL: `
    DELETE FROM "User" WHERE id = $1
  `,
  deleteCVSQL: `UPDATE "User" SET cv = NULL WHERE id = $1`,
  setCertificatesSQL: `UPDATE "User" SET certificates = $1 WHERE id = $2`,
  setSocialsSQL: `UPDATE "User" SET socials = $1 WHERE id = $2`,

  getAllApplicationsForJobSQL: `
  SELECT 
    ap.id,
    u.first_name AS first_name,
    u.last_name AS last_name, 
    s.status_desc, 
    ap.submitted_at, 
    ap.selected_at, 
    ap.rejected_at, 
    ap.cv, 
    ap.cover_letter, 
    ap.projects, 
    ap.certificates
  FROM "Application" ap
  INNER JOIN "User" u ON ap.talent_id = u.id
  INNER JOIN "Application_Status" s ON ap.application_status_id = s.id
  WHERE ap.job_posting_id = $1
`,
  getApplicationByIdSQL: `
  SELECT 
    ap.*, 
    u.first_name, 
    u.last_name, 
    jp.title AS job_title, 
    jp.company AS job_company, 
    jp.cv_field AS cv_required,
    jp.cover_letter_field AS cover_letter_required,
    jp.projects_field AS projects_required,
    jp.certificates_field AS certificates_required,
    s.status_desc
  FROM "Application" ap
  INNER JOIN "User" u ON ap.talent_id = u.id
  INNER JOIN "Job_Posting" jp ON ap.job_posting_id = jp.id
  INNER JOIN "Application_Status" s ON ap.application_status_id = s.id -- Join with Application_Status
  WHERE ap.id = $1
`,

  getAppliedJobsSQL: `
    SELECT DISTINCT j.*, 
           CASE WHEN a.talent_id IS NOT NULL THEN true ELSE false END AS has_applied
    FROM "Job_Posting" j
    LEFT JOIN "Application" a ON j.id = a.job_posting_id AND a.talent_id = $1
    WHERE j.is_archived = false
    
  `,

  createAppScoreSQL: `INSERT INTO "Application_Score" ("application_id", "hr_id", "talent_id") VALUES ($1, $2, $3) RETURNING id`,
  setStatusViewedSQL: `UPDATE "Application" SET application_status_id=2 WHERE id=$1`,
  setStatusInvitedSQL: `UPDATE "Application" SET application_status_id=3 WHERE id=$1`,
  setStatusShortlistenSQL: `UPDATE "Application" SET application_status_id=4 WHERE id=$1`,
  setStatusRejectedSQL: `UPDATE "Application" SET application_status_id=5 WHERE id=$1`,

  setEducationScoreSQL: `UPDATE "Application_Score" SET education_score=$1 WHERE id = $2`,
  setSkillsScoreSQL: `UPDATE "Application_Score" SET education_score=$1 WHERE id = $2`,
  setExperienceScoreSQL: `UPDATE "Application_Score" SET education_score=$1 WHERE id = $2`,
  setLanguagesScoreSQL: `UPDATE "Application_Score" SET languages_score=$1 WHERE id = $2`,
  setCertificateScoreSQL: `UPDATE "Application_Score" SET certificate_score=$1 WHERE id = $2`,
  setProjectsScoreSQL: `UPDATE "Application_Score" SET projects_score=$1 WHERE id = $2`,
  setTotalScoreSQL: `
  UPDATE "Application_Score"
  SET total_score = (
    (
      COALESCE(education_score, 0) +
      COALESCE(skills_score, 0) +
      COALESCE(experience_score, 0) +
      COALESCE(languages_score, 0) +
      COALESCE(certificate_score, 0) +
      COALESCE(projects_score, 0)
    )::NUMERIC / -- Ensures the result is a NUMERIC type, keeping decimals
    (
      (CASE WHEN education_score IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN skills_score IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN experience_score IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN languages_score IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN certificate_score IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN projects_score IS NOT NULL THEN 1 ELSE 0 END)
    )
  )
  WHERE id = $1
`,
  getAllTalentsSQL: `
    SELECT * FROM "User" WHERE role_id = 2
  `,
  getUserByEmailSQL: `SELECT * FROM "User" WHERE "email" = $1`,
  getTalentByIdSQL: `
    SELECT * FROM "User" WHERE role_id = 2 AND id = $1
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
    RETURNING *
  `,

  updateHRSQL: `
    UPDATE "User"
    SET "first_name" = $1, "last_name" = $2, "email" = $3, "company_name" = $4
    WHERE "id" = $5
  `,
  getAllActiveJobsSQL: `SELECT * FROM "Job_Posting" WHERE is_archived=false`,
  createJobPostingSQL: `
    INSERT INTO "Job_Posting" ("title", "description", "city", "application_deadline", "company", "cv_field", "cover_letter_field", "projects_field", "certificates_field", "hr_id") 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `,
  getUserApplicationsSQL: `SELECT a.id AS application_id,
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
    SELECT * FROM "Job_Posting" WHERE hr_id = $1
  `,
  getJobPostingByIdSQL: `
    SELECT * FROM "Job_Posting" WHERE id = $1
  `,
  getApplicationStatusSQL: `SELECT status_table.status_desc FROM "Application_Status" as status_table JOIN "Application" as a ON status_table.id=a.application_status_id WHERE a.job_posting_id=$1 AND a.talent_id = $2`,
  createApplicationSQL: `INSERT INTO "Application" (talent_id, job_posting_id, application_status_id) VALUES ($1, $2, $3) RETURNING id`,
  setApplicationCVSQL: `UPDATE "Application" SET "cv" = $1 WHERE "id" = $2`,
  setApplicationCoverLetterSQL: `UPDATE "Application" SET "cover_letter" = $1 WHERE "id" = $2`,
  setApplicationProjectsSQL: `UPDATE "Application" SET "projects" = $1 WHERE "id" = $2`,
  setApplicationCertificatesSQL: `UPDATE "Application" SET "certificates" = $1 WHERE "id" = $2`,
};

module.exports = queries;
