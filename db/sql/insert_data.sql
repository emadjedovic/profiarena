-- insert_data.sql

-- Insert initial roles into the Role table
INSERT INTO "Role" ("name") VALUES
    ('hr'),
    ('talent');

-- Insert initial statuses into the Application_Status table
INSERT INTO "Application_Status" ("status_desc") VALUES
    ('applied'),
    ('viewed'),
    ('invited'),
    ('shortlisted'),
    ('rejected');
