DROP TABLE IF EXISTS "Role" CASCADE;
CREATE TABLE "Role" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO "Role" ("name") VALUES
    ('hr'),
    ('talent');

DROP TABLE IF EXISTS "Application_Status" CASCADE;
CREATE TABLE "Application_Status" (
    "id" SERIAL PRIMARY KEY,
    "status_desc" VARCHAR(50) NOT NULL
);

INSERT INTO "Application_Status" ("status_desc") VALUES
    ('applied'),
    ('viewed'),
    ('invited'),
    ('shortlisted'),
    ('rejected');

