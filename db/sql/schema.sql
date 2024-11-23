-- schema.sql

DROP TABLE IF EXISTS "Role" CASCADE;
CREATE TABLE "Role" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS "User" CASCADE;
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "role_id" INTEGER NOT NULL REFERENCES "Role"("id") ON DELETE CASCADE,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "company_name" VARCHAR(255),
    "address" TEXT,
    "date_of_birth" DATE,
    "about" TEXT,
    "education" TEXT,
    "skills" TEXT,
    "languages" TEXT,
    "socials" TEXT,
    "cv" VARCHAR(255),
    "projects" VARCHAR(255),
    "certificates" VARCHAR(255)
);

DROP TABLE IF EXISTS "Job_Posting" CASCADE;
CREATE TABLE "Job_Posting" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "hr_id" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "city" VARCHAR(50) NOT NULL,
    "street_address" VARCHAR(100),
    "application_deadline" DATE NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE,
    "cv_field" BOOLEAN DEFAULT FALSE,
    "cover_letter_field" BOOLEAN DEFAULT FALSE,
    "projects_field" BOOLEAN DEFAULT FALSE,
    "certificates_field" BOOLEAN DEFAULT FALSE,
    "company" VARCHAR(100) NOT NULL
);

DROP TABLE IF EXISTS "Application_Status" CASCADE;
CREATE TABLE "Application_Status" (
    "id" SERIAL PRIMARY KEY,
    "status_desc" VARCHAR(50) NOT NULL
);

DROP TABLE IF EXISTS "Applications" CASCADE;
CREATE TABLE "Applications" (
    "id" SERIAL PRIMARY KEY,
    "candidate_id" INT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "job_posting_id" INT NOT NULL REFERENCES "Job_Posting"("id") ON DELETE CASCADE,
    "application_status_id" INT NOT NULL REFERENCES "Application_Status"("id") ON DELETE CASCADE,
    "submitted_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "selected_at" TIMESTAMP,
    "rejected_at" TIMESTAMP,
    "cv" VARCHAR(255),
    "cover_letter" VARCHAR(255),
    "projects" VARCHAR(255),
    "certificates" VARCHAR(255)
);

DROP TABLE IF EXISTS "Application_Score" CASCADE;
CREATE TABLE "Application_Score" (
    "id" SERIAL PRIMARY KEY,
    "application_id" INT NOT NULL REFERENCES "Applications"("id") ON DELETE CASCADE,
    "hr_id" INT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "candidate_id" INT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "education_score" INT CHECK (education_score BETWEEN 1 AND 5),
    "skills_score" INT CHECK (skills_score BETWEEN 1 AND 5),
    "experience_score" INT CHECK (experience_score BETWEEN 1 AND 5),
    "languages_score" INT CHECK (languages_score BETWEEN 1 AND 5),
    "certificate_score" INT CHECK (certificate_score BETWEEN 1 AND 5),
    "projects_score" INT CHECK (projects_score BETWEEN 1 AND 5),
    "total_score" INT,
    "comments" TEXT
);


