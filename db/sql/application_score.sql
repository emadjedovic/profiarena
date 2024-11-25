DROP TABLE IF EXISTS "Application_Score" CASCADE;
CREATE TABLE "Application_Score" (
    "id" SERIAL PRIMARY KEY,
    "application_id" INT NOT NULL REFERENCES "Application"("id") ON DELETE CASCADE,
    "hr_id" INT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "talent_id" INT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "education_score" INT CHECK (education_score BETWEEN 1 AND 5),
    "skills_score" INT CHECK (skills_score BETWEEN 1 AND 5),
    "experience_score" INT CHECK (experience_score BETWEEN 1 AND 5),
    "languages_score" INT CHECK (languages_score BETWEEN 1 AND 5),
    "certificate_score" INT CHECK (certificate_score BETWEEN 1 AND 5),
    "projects_score" INT CHECK (projects_score BETWEEN 1 AND 5),
    "total_score" INT,
    "comments" TEXT
);
