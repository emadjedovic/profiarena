const appScoreQueries = {
  setScoresSQL: `UPDATE "Application_Score"
    SET 
      education_score = $1,
      skills_score = $2,
      experience_score = $3,
      languages_score = $4,
      certificate_score = $5,
      projects_score = $6
    WHERE id = $7`,
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
  deleteAppScoreSQL: `
DELETE FROM "Application_Score" 
WHERE "application_id" = $1
RETURNING id;
`,
  insertAppScoreSQL: `INSERT INTO "Application_Score" ("application_id", "hr_id", "talent_id") VALUES ($1, $2, $3) RETURNING id`,
  addCommentSQL: `UPDATE "Application_Score" SET "comments"=$1 WHERE "id"=$2`,
  getApplicationScoreByApplicationIdSQL: `
SELECT * FROM "Application_Score" WHERE "application_id" = $1
`,
};

module.exports = appScoreQueries;
