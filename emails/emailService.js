const nodemailer = require("nodemailer");
const { client } = require("../db/connect"); // Import existing database client
const ejs = require("ejs");
const path = require("path");
const queries = require("../db/queries");

// Configure transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
Sends an email and logs the communication in the database.

text - Email content.
senderId - ID of the sender in the "User" table.
ID of the receiver in the "User" table.
interviewId - ID of the related interview.
 */

const { formatDate } = require("../utils/dateFormating"); // Import formatDate function

async function sendEmail(
  to,
  subject,
  templateName,
  templateData,
  senderId,
  receiverId,
  interviewId
) {
  // Path to the template file
  const templatePath = path.join(
    __dirname,
    "..",
    "views",
    "emails",
    `${templateName}.ejs`
  );

  try {
    // Add formatDate to templateData
    const renderedTemplate = await ejs.renderFile(templatePath, {
      ...templateData,
      formatDate, // Pass formatDate to the template
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: renderedTemplate, // Use the rendered HTML content
    };

    // Send email via Nodemailer
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);

    // Log email communication in the database
    await client.query(
      `INSERT INTO "Email_Communication" (interview_id, sender_id, receiver_id, subject, message)
             VALUES ($1, $2, $3, $4, $5)`,
      [interviewId, senderId, receiverId, subject, renderedTemplate]
    );

    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
}

/**
 * Sends application status update email based on the new status.
 */
const sendApplicationStatusEmail = async (
  applicationId,
  newStatus,
  talentId,
  confirmationLink,
  rejectionLink
) => {
  try {
    // Step 1: Get the status description for the new status
    const statusResult = await client.query(
      `SELECT "status_desc" FROM "Application_Status" WHERE id = $1`,
      [newStatus]
    );

    if (statusResult.rows.length === 0) {
      console.error("Status not found.");
      return;
    }

    const status_desc = statusResult.rows[0].status_desc;

    // Step 2: Fetch application details and the talent's email
    const result = await client.query(queries.getApplicationByIdSQL, [
      applicationId,
    ]);
    const emailResult = await client.query(
      'SELECT email FROM "User" WHERE id = $1',
      [talentId]
    );
    const email = emailResult.rows[0].email;

    if (result.rows.length === 0) {
      console.error("Application not found or invalid status.");
      return;
    }

    const { first_name, last_name, job_title, job_company } = result.rows[0];

    // Step 3: Handle different statuses and choose the correct email template
    let subject, templateData, templateName;

    switch (status_desc) {
      case "applied":
        subject = `Update: Your Application for "${job_title}" at ${job_company}`;
        templateName = "viewed"; // Common template for applied
        templateData = {
          applicationId,
          first_name,
          last_name,
          status_desc,
          job_title,
          job_company,
        };
        break;

      case "viewed":
        subject = `Update: Your Application for "${job_title}" at ${job_company}`;
        templateName = "applied"; // Common template for viewed
        templateData = {
          applicationId,
          first_name,
          last_name,
          status_desc,
          job_title,
          job_company,
        };
        break;

      case "invited":
        // Fetch interview details for the "invited" status
        const interviewResult = await client.query(
          `SELECT * FROM "Interview_Schedule" WHERE "application_id" = $1 AND "talent_id" = $2`,
          [applicationId, talentId]
        );

        if (interviewResult.rows.length === 0) {
          console.error("Interview schedule not found.");
          return;
        }

        console.log("confirmation link: ", confirmationLink);

        const interviewDetails = interviewResult.rows[0];
        subject = `Interview Invitation: Your Application for "${job_title}" at ${job_company}`;
        templateName = "invited"; // Custom template for invited status
        templateData = {
          applicationId,
          first_name,
          last_name,
          job_title,
          job_company,
          proposed_time: interviewDetails.proposed_time,
          is_online: interviewDetails.is_online,
          city: interviewDetails.city,
          street_address: interviewDetails.street_address,
          interview_id: interviewDetails.id,
          confirm_link: confirmationLink,
          reject_link: rejectionLink,
        };
        break;

      case "shortlisted":
        subject = `Update: Your Application for "${job_title}" at ${job_company}`;
        templateName = "shortlisted"; // Common template for shortlisted
        templateData = {
          applicationId,
          first_name,
          last_name,
          status_desc,
          job_title,
          job_company,
        };
        break;

      case "rejected":
        subject = `Update: Your Application for "${job_title}" at ${job_company}`;
        templateName = "rejected"; // Common template for rejected
        templateData = {
          applicationId,
          first_name,
          last_name,
          status_desc,
          job_title,
          job_company,
        };
        break;

      default:
        console.error("Unknown status.");
        return;
    }

    // Step 4: Send the email with the chosen template (via the existing sendEmail function)
    await sendEmail(
      email,
      subject,
      templateName,
      templateData,
      null,
      talentId,
      null
    );
    console.log(`Notification email sent for status: ${status_desc}`);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err; // Handle the error appropriately in the calling function
  }
};

module.exports = { sendEmail, sendApplicationStatusEmail };
