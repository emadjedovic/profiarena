DROP TABLE IF EXISTS "session" CASCADE;

CREATE TABLE IF NOT EXISTS "session" (
    "sid" VARCHAR NOT NULL PRIMARY KEY,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL
) WITH (OIDS = FALSE);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");