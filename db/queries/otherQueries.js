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
getCandidateScoresAndReviewsSQL: `SELECT 
  u.first_name, 
  u.last_name, 
  u.email, 
  j.title AS job_title, 
  a.submitted_at, 
  a.selected_at, 
  a.rejected_at, 
  a.application_status_id, 
  s.education_score, 
  s.skills_score, 
  s.experience_score, 
  s.languages_score, 
  s.certificate_score, 
  s.projects_score, 
  s.cover_letter_score, 
  s.total_score,
  interview.review AS review
FROM "Application" a
JOIN "User" u ON a.talent_id = u.id
JOIN "Job_Posting" j ON a.job_posting_id = j.id
LEFT JOIN "Application_Score" s ON a.id = s.application_id
LEFT JOIN "Interview_Schedule" interview ON a.talent_id = interview.talent_id
WHERE a.job_posting_id = $1;
`
};

module.exports = otherQueries;
