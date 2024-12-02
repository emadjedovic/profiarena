const interviewQueries = {
  createInterviewScheduleSQL: `
INSERT INTO "Interview_Schedule" 
    ("application_id", "hr_id", "talent_id", "proposed_time", "i_schedule_online", "city", "street_address", "interview_status_id", "review")
VALUES 
    ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;
`,
  getInterviewsByHRSQL: `
SELECT 
    i_schedule.*, 
    U1.first_name AS hr_first_name,
    U1.last_name AS hr_last_name,
    U2.first_name AS talent_first_name, 
    U2.last_name AS talent_last_name,
    S.status_desc
FROM "Interview_Schedule" i_schedule
JOIN "User" U1 ON i_schedule.hr_id = U1.id
JOIN "User" U2 ON i_schedule.talent_id = U2.id
JOIN "Interview_Status" S ON i_schedule.interview_status_id = S.id
WHERE i_schedule.hr_id = $1
ORDER BY i_schedule.proposed_time DESC;

`,
  getInterviewsByTalentSQL: `
SELECT 
    i_schedule.*, 
    U1.company_name AS hr_company_name, 
    U2.first_name AS talent_first_name, 
    U2.last_name AS talent_last_name,
    S.status_desc
FROM "Interview_Schedule" i_schedule
JOIN "User" U1 ON i_schedule.hr_id = U1.id
JOIN "User" U2 ON i_schedule.talent_id = U2.id
JOIN "Interview_Status" S ON i_schedule.interview_status_id = S.id
WHERE i_schedule.talent_id = $1
ORDER BY i_schedule.proposed_time DESC;
`,
  updateInterviewScheduleSQL: `
UPDATE "Interview_Schedule"
SET 
    "proposed_time" = COALESCE($2, "proposed_time"),
    "i_schedule_online" = COALESCE($3, "i_schedule_online"),
    "city" = COALESCE($4, "city"),
    "street_address" = COALESCE($5, "street_address"),
    "interview_status_id" = COALESCE($6, "interview_status_id"),
    "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = $1
RETURNING *;
`,
  deleteInterviewScheduleSQL: `
DELETE FROM "Interview_Schedule"
WHERE "id" = $1
RETURNING *;
`,
  getInterviewByIdSQL: `
SELECT 
    i_schedule.*, 
    U1.name AS hr_name, 
    U2.name AS talent_name, 
    S.status_desc
FROM "Interview_Schedule" i_schedule
JOIN "User" U1 ON i_schedule.hr_id = U1.id
JOIN "User" U2 ON i_schedule.talent_id = U2.id
JOIN "Interview_Status" S ON i_schedule.interview_status_id = S.id
WHERE i_schedule.id = $1;
`,
  getInterviewsByStatusSQL: `
SELECT 
    i_schedule.*, 
    U1.name AS hr_name, 
    U2.name AS talent_name, 
    S.status_desc
FROM "Interview_Schedule" i_schedule
JOIN "User" U1 ON i_schedule.hr_id = U1.id
JOIN "User" U2 ON i_schedule.talent_id = U2.id
JOIN "Interview_Status" S ON i_schedule.interview_status_id = S.id
WHERE i_schedule.interview_status_id = $1
ORDER BY i_schedule.proposed_time ASC;
`,
  getInterviewCountsByStatusSQL: `
SELECT 
    S.status_desc, 
    COUNT(*) AS count
FROM "Interview_Schedule" i_schedule
JOIN "Interview_Status" S ON i_schedule.interview_status_id = S.id
GROUP BY S.status_desc
ORDER BY count DESC;
`,
  getUpcomingInterviewsSQL: `
SELECT 
    i_schedule.*, 
    U1.name AS hr_name, 
    U2.name AS talent_name, 
    S.status_desc
FROM "Interview_Schedule" i_schedule
JOIN "User" U1 ON i_schedule.hr_id = U1.id
JOIN "User" U2 ON i_schedule.talent_id = U2.id
JOIN "Interview_Status" S ON i_schedule.interview_status_id = S.id
WHERE i_schedule.proposed_time BETWEEN $1 AND $2
ORDER BY i_schedule.proposed_time ASC;
`,
  updatereviewSQL: `
UPDATE "Interview_Schedule"
SET 
    "review" = $2,
    "interview_status_id" = 4, -- Status ID for 'fini_schedulehed'
    "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = $1
RETURNING *;
`,
};

module.exports = interviewQueries;
