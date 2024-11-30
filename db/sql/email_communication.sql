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


/*
This table logs all email exchanges related to a specific interview.
sender_id and receiver_id point to users with roles hr and talent.
You could extend this with an external mail service for sending real emails
*/

CREATE OR REPLACE FUNCTION send_interview_email_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Call an external service or use pg_notify for sending email notifications
    PERFORM pg_notify(
        'email_channel',
        json_build_object(
            'application_id', NEW.application_id,
            'proposed_time', NEW.proposed_time,
            'talent_id', NEW.talent_id,
            'hr_id', NEW.hr_id,
            'is_online', NEW.is_online,
            'city', NEW.city,
            'street_address', NEW.street_address
        )::text
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_send_email_notification
AFTER INSERT ON "Interview_Schedule"
FOR EACH ROW
EXECUTE FUNCTION send_interview_email_notification();


/*
pg_notify can be replaced with a custom integration to an email-sending service (like SendGrid, SMTP, etc.).
When a new interview is scheduled, this trigger will automatically notify the talent.
*/