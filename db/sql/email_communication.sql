DROP TABLE IF EXISTS "Email_Communication" CASCADE;

CREATE TABLE "Email_Communication" (
    "id" SERIAL PRIMARY KEY,
    "interview_id" INT REFERENCES "Interview_Schedule"("id") ON DELETE CASCADE,
    "sender_id" INT REFERENCES "User"("id") ON DELETE CASCADE,
    "receiver_id" INT REFERENCES "User"("id") ON DELETE CASCADE,
    "subject" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" TEXT[],
    "delivery_status" VARCHAR(50) DEFAULT 'pending',
    "sent_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);