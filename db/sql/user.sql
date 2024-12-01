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
    "education" TEXT [],
    "skills" TEXT [],
    "languages" TEXT [],
    "socials" TEXT [],
    "projects" TEXT,
    "cv" VARCHAR(255),
    "certificates" VARCHAR(255) [],
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);