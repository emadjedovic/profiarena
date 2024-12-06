DROP TABLE IF EXISTS "Application" CASCADE;

CREATE TABLE "Application" (
    "id" SERIAL PRIMARY KEY,
    "talent_id" INT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "job_posting_id" INT NOT NULL REFERENCES "Job_Posting"("id") ON DELETE CASCADE,
    "application_status_id" INT NOT NULL DEFAULT 1 REFERENCES "Application_Status"("id") ON DELETE CASCADE,
    "submitted_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "selected_at" TIMESTAMP,
    "rejected_at" TIMESTAMP,
    "cv" VARCHAR(255),
    "cover_letter" VARCHAR(255),
    "projects" TEXT,
    "certificates" VARCHAR(255) [],
    "talent_feedback" TEXT,
    "message_to_talent" TEXT,
    "feedback_token" TEXT
);

CREATE INDEX idx_application_status ON "Application" ("application_status_id");