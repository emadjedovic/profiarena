DROP TABLE IF EXISTS "Interview_Status" CASCADE;

CREATE TABLE "Interview_Status" (
    "id" SERIAL PRIMARY KEY,
    "status_desc" VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO "Interview_Status" ("status_desc") VALUES
    ('not_confirmed'),
    ('confirmed'),
    ('finished');

