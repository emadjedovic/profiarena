-- schema.sql

-- Drop tables if they exist
DROP TABLE IF EXISTS "JobPosting" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE;

-- Create Role table
CREATE TABLE "Role" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL UNIQUE
);

-- Create User table
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

-- Create JobPosting table
CREATE TABLE "JobPosting" (
    "id" SERIAL PRIMARY KEY,
    "hr_id" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(255),
    "salary" DECIMAL(10, 2),
    "posted_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
