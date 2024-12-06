const { client } = require("../db/connect");

const fetchAllTalents = async (req, res) => {
  try {
    const { search } = req.query;

    // Base query for fetching users with role_id 2 (talents)
    let SQLquery = `
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.address, u.date_of_birth, 
        u.education, u.skills, u.about, u.languages, u.socials, u.projects, u.created_at
      FROM "User" AS u
      WHERE u.role_id = 2
    `;

    const values = [];

    // If search input is provided, add conditions to match across multiple fields
    if (search) {
      const searchPattern = `%${search}%`;
      SQLquery += `
        AND (
          u.first_name ILIKE $1 OR
          u.last_name ILIKE $1 OR
          u.email ILIKE $1 OR
          u.phone ILIKE $1 OR
          u.address ILIKE $1 OR
          u.education::TEXT ILIKE $1 OR
          u.skills::TEXT ILIKE $1 OR
          u.about ILIKE $1 OR
          u.languages::TEXT ILIKE $1 OR
          u.socials::TEXT ILIKE $1 OR
          u.projects ILIKE $1 OR
          TO_CHAR(u.date_of_birth, 'YYYY-MM-DD') ILIKE $1
        )
      `;
      values.push(searchPattern);
    }

    SQLquery += " ORDER BY u.first_name";

    const results = await client.query(SQLquery, values);

    res.render("hr/all-talents", {
      currentUser: req.user,
      talents: results.rows,
      search, // Pass the search query back to the view
    });
  } catch (error) {
    console.error("Error fetching talents:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { fetchAllTalents };
