const otherQueries = {
  getAppliedJobsSQL: `
    SELECT DISTINCT j.*, 
           CASE WHEN a.talent_id IS NOT NULL THEN true ELSE false END AS has_applied
    FROM "Job_Posting" j
    LEFT JOIN "Application" a ON j.id = a.job_posting_id AND a.talent_id = $1
    WHERE j.is_archived = false
    
  `,
  getUserApplicationsSQL: `SELECT a.id AS application_id,
  a.job_posting_id,
  a.cv,
  a.cover_letter,
  a.projects,
  a.certificates, 
  jp.title AS job_title, 
  jp.company AS company,
  as_table.status_desc AS application_status, 
  a.submitted_at
FROM "Application" AS a
JOIN "Job_Posting" AS jp ON a.job_posting_id = jp.id
JOIN "Application_Status" AS as_table ON a.application_status_id = as_table.id
WHERE a.talent_id = $1`,
};

module.exports = otherQueries;
