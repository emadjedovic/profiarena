DROP TABLE IF EXISTS "Interview_Schedule" CASCADE;

CREATE TABLE "Interview_Schedule" (
    "id" SERIAL PRIMARY KEY,
    "application_id" INT NOT NULL REFERENCES "Application"("id") ON DELETE CASCADE,
    "hr_id" INT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "talent_id" INT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "proposed_time" TIMESTAMP NOT NULL,
    "is_online" BOOLEAN NOT NULL DEFAULT FALSE,
    "city" VARCHAR(50),                      
    "street_address" VARCHAR(100),          
    "interview_status_id" INT NOT NULL DEFAULT 1 REFERENCES "Interview_Status"("id"),
    "feedback" TEXT DEFAULT NULL,          
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add a CHECK constraint to enforce city and street_address for on-site interviews
ALTER TABLE "Interview_Schedule"
ADD CONSTRAINT check_address_for_onsite
CHECK (
    is_online = TRUE OR (city IS NOT NULL AND street_address IS NOT NULL)
);
