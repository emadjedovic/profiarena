const appQueries =
{
    createApplicationSQL: `INSERT INTO "Application" (talent_id, job_posting_id, application_status_id) VALUES ($1, $2, 1) RETURNING id`,
    setApplicationCVSQL: `UPDATE "Application" SET "cv" = $1 WHERE "id" = $2`,
    setApplicationCoverLetterSQL: `UPDATE "Application" SET "cover_letter" = $1 WHERE "id" = $2`,
    setApplicationProjectsSQL: `UPDATE "Application" SET "projects" = $1 WHERE "id" = $2`,
    setApplicationCertificatesSQL: `UPDATE "Application" SET "certificates" = $1 WHERE "id" = $2`,
    getApplicationStatusSQL: `SELECT status_table.status_desc FROM "Application_Status" as status_table JOIN "Application" as a ON status_table.id=a.application_status_id WHERE a.job_posting_id=$1 AND a.talent_id = $2`,
  setStatusSQL: `UPDATE "Application" SET application_status_id = $1 WHERE id = $2`,
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
  ap.certificates,
  ascore.total_score
FROM "Application" ap
INNER JOIN "User" u ON ap.talent_id = u.id
INNER JOIN "Application_Status" s ON ap.application_status_id = s.id
LEFT JOIN "Application_Score" ascore ON ap.id = ascore.application_id
WHERE ap.job_posting_id = $1
ORDER BY ascore.total_score DESC NULLS LAST
`,
}

module.exports = appQueries;