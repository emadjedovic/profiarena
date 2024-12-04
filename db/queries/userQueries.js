const userQueries = {
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
  getAllTalentsSQL: `
SELECT * FROM "User" WHERE role_id = 2
`,
  getUserByEmailSQL: `SELECT * FROM "User" WHERE "email" = $1`,
  getTalentByIdSQL: `
SELECT * FROM "User" WHERE role_id = 2 AND id = $1
`,
  getUserEmailByIdSQL: `
    SELECT email 
    FROM "User" 
    WHERE id = $1
  `,
};

module.exports = userQueries;
