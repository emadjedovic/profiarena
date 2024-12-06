const { client } = require("../db/connect");
const { formatDate } = require("../utils/dateFormating");

const fetchAllTalents = async (req, res) => {
    try {
      const { education, skills, status } = req.query;
  
      // Query with optional filters
      const SQLquery = `
       SELECT
  u.id, u.first_name, u.last_name, u.email, u.education, u.skills,
  u.created_at, app.application_status_id, app.submitted_at
FROM "User" AS u
INNER JOIN "Application" AS app ON u.id = app.talent_id
WHERE
  u.role_id = 2 AND
  ($1::text[] IS NULL OR u.education @> $1::text[]) AND
  ($2::text[] IS NULL OR u.skills @> $2::text[]) AND
  ($3::int IS NULL OR app.application_status_id = $3)
ORDER BY u.last_name, app.submitted_at
`;
  
      const values = [
        education ? education.split(",") : null,
        skills ? skills.split(",") : null,
        status || null,
      ];
  
      const results = await client.query(SQLquery, values);
  
      res.render("hr/all-talents", {
        currentUser: req.user,
        talents: results.rows,
        filters: { education, skills, status },
        formatDate
      });
    } catch (error) {
      console.error("Error fetching talents:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  module.exports = { fetchAllTalents };
  