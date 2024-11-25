DROP TABLE IF EXISTS "Role" CASCADE;
CREATE TABLE "Role" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO "Role" ("name") VALUES
    ('hr'),
    ('talent');



