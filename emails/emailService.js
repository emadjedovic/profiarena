const nodemailer = require("nodemailer");
const { client } = require("../db/connect");
const ejs = require("ejs");
const path = require("path");

const {
  getApplicationByIdSQL
} = require("../db/queries/appQueries");
const { getUserEmailByIdSQL } = require("../db/queries/userQueries")

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

const sendViewedEmail = async (applicationId, talentId) => {
  const result = await client.query(getApplicationByIdSQL, [
    applicationId,
  ]);
  const emailResult = await client.query(
    getUserEmailByIdSQL,
    [talentId]
  );
  const email = emailResult.rows[0].email;

  if (result.rows.length === 0) {
    console.error("Application not found or invalid status.");
    return;
  }
  try {
    const { first_name, last_name, job_title, job_company } = result.rows[0];

    let subject = `Your application for "${job_title}" at ${job_company} has been viewed.`;
    let templateName = "viewed"; // Common template for viewed
    let templateData = {
      applicationId,
      first_name,
      last_name,
      job_title,
      job_company,
    };
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
    console.log(
      `Notification email sent for changing application status to "viewed".`
    );
  } catch (err) {
    console.error("Error sending email:", err);
    throw err; // Handle the error appropriately in the calling function
  }
};

const sendInvitedEmail = async (
  applicationId,
  talentId,
  confirmationLink,
  rejectionLink
) => {
  try {
    const result = await client.query(getApplicationByIdSQL, [
      applicationId,
    ]);
    const emailResult = await client.query(
      getUserEmailByIdSQL,
      [talentId]
    );
    const email = emailResult.rows[0].email;

    if (result.rows.length === 0) {
      console.error("Application not found or invalid status.");
      return;
    }

    const { first_name, last_name, job_title, job_company } = result.rows[0];

    const interviewResult = await client.query(
      `SELECT * FROM "Interview_Schedule" WHERE "application_id" = $1 AND "talent_id" = $2`,
      [applicationId, talentId]
    );

    if (interviewResult.rows.length === 0) {
      console.error("Interview schedule not found.");
      return;
    }

    console.log("confirmation link from sendInvitedEmail: ", confirmationLink);

    const interviewDetails = interviewResult.rows[0];
    let subject = `Invited for "${job_title}" at ${job_company}`;
    let templateName = "invited"; // Custom template for invited status
    let templateData = {
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

    await sendEmail(
      email,
      subject,
      templateName,
      templateData,
      null,
      talentId,
      null
    );
    console.log(`Notification email sent for interview invitation.`);
  } catch (error) {
    console.error("Error sending email:", err);
    throw err; // Handle the error appropriately in the calling function
  }
};

const sendAppliedEmail = async (applicationId, talentId) => {
  try {
    const result = await client.query(getApplicationByIdSQL, [
      applicationId,
    ]);
    const emailResult = await client.query(
      getUserEmailByIdSQL,
      [talentId]
    );
    const email = emailResult.rows[0].email;

    if (result.rows.length === 0) {
      console.error("Application not found or invalid status.");
      return;
    }

    const { first_name, last_name, job_title, job_company } = result.rows[0];

    let subject = `Applied for "${job_title}" at ${job_company}`;
    let templateName = "applied"; // Common template for applied
    let templateData = {
      applicationId,
      first_name,
      last_name,
      job_title,
      job_company,
    };

    await sendEmail(
      email,
      subject,
      templateName,
      templateData,
      null,
      talentId,
      null
    );
    console.log(`Notification email sent after applying to a position.`);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err; // Handle the error appropriately in the calling function
  }
};

const sendShortlistedEmail = async (applicationId, talentId) => {
  try {
    const result = await client.query(getApplicationByIdSQL, [
      applicationId,
    ]);
    const emailResult = await client.query(
      getUserEmailByIdSQL,
      [talentId]
    );
    const email = emailResult.rows[0].email;

    if (result.rows.length === 0) {
      console.error("Application not found or invalid status.");
      return;
    }

    const { first_name, last_name, job_title, job_company } = result.rows[0];

    let subject = `Shortlisted for "${job_title}" at ${job_company}`;
    let templateName = "shortlisted"; // Common template for shortlisted
    let templateData = {
      applicationId,
      first_name,
      last_name,
      job_title,
      job_company,
    };

    await sendEmail(
      email,
      subject,
      templateName,
      templateData,
      null,
      talentId,
      null
    );
    console.log(`Notification email sent for shortlisted status.`);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err; // Handle the error appropriately in the calling function
  }
};

const sendRejectedEmail = async (applicationId, talentId) => {
  try {
    const result = await client.query(getApplicationByIdSQL, [
      applicationId,
    ]);
    const emailResult = await client.query(
      getUserEmailByIdSQL,
      [talentId]
    );
    const email = emailResult.rows[0].email;

    if (result.rows.length === 0) {
      console.error("Application not found or invalid status.");
      return;
    }

    const { first_name, last_name, job_title, job_company } = result.rows[0];

    let subject = `Rejection for "${job_title}" at ${job_company}`;
    let templateName = "rejected"; // Common template for rejected
    let templateData = {
      applicationId,
      first_name,
      last_name,
      job_title,
      job_company,
    };

    await sendEmail(
      email,
      subject,
      templateName,
      templateData,
      null,
      talentId,
      null
    );
    console.log(`Notification email sent for rejected status.`);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err; // Handle the error appropriately in the calling function
  }
};

module.exports = {
  sendEmail,
  sendAppliedEmail,
  sendViewedEmail,
  sendInvitedEmail,
  sendShortlistedEmail,
  sendRejectedEmail,
};
