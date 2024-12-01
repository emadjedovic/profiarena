DROP TABLE IF EXISTS "Application_Status" CASCADE;
CREATE TABLE "Application_Status" (
    "id" SERIAL PRIMARY KEY,
    "status_desc" VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO "Application_Status" ("status_desc") VALUES
    ('applied'),
    ('viewed'),
    ('invited'),
    ('shortlisted'),
    ('rejected');