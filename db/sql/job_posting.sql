DROP TABLE IF EXISTS "Job_Posting" CASCADE;
CREATE TABLE "Job_Posting" (
    "id" SERIAL PRIMARY KEY,
    "company" VARCHAR(100) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL DEFAULT 'No description',
    "hr_id" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "city" VARCHAR(50) NOT NULL,
    "street_address" VARCHAR(100),
    "application_deadline" DATE NOT NULL,
    "is_archived" BOOLEAN DEFAULT FALSE,
    "cv_field" BOOLEAN DEFAULT FALSE,
    "cover_letter_field" BOOLEAN DEFAULT FALSE,
    "projects_field" BOOLEAN DEFAULT FALSE,
    "certificates_field" BOOLEAN DEFAULT FALSE
);