const nodemailer = require("nodemailer");
const { client } = require("../db/connect");
const ejs = require("ejs");
const path = require("path");

const {
  getApplicationByIdSQL
} = require("../db/queries/appQueries");
const { getUserEmailByIdSQL } = require("../db/queries/userQueries")


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

const { formatDate } = require("../utils/dateFormating"); 

async function sendEmail(
  to,
  subject,
  templateName,
  templateData,
  senderId,
  receiverId,
  interviewId
) {
  
  const templatePath = path.join(
    __dirname,
    "..",
    "views",
    "emails",
    `${templateName}.ejs`
  );

  try {
    
    const renderedTemplate = await ejs.renderFile(templatePath, {
      ...templateData,
      formatDate, 
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: renderedTemplate, 
    };

    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);

    
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
    let templateName = "viewed"; 
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
    console.log(
      `Notification email sent for changing application status to "viewed".`
    );
  } catch (err) {
    console.error("Error sending email:", err);
    throw err; 
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
    let templateName = "invited"; 
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
    throw err; 
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
    let templateName = "applied"; 
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
    throw err; 
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
    let templateName = "shortlisted"; 
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
    throw err; 
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
    let templateName = "rejected"; 
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
    throw err; 
  }
};

const sendAcceptedEmail = async (applicationId, talentId) => {
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

    let subject = `Accepted for "${job_title}" at ${job_company}`;
    let templateName = "accepted";
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
    console.log(`Notification email sent for accepted status.`);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err; 
  }
};

module.exports = {
  sendEmail,
  sendAppliedEmail,
  sendViewedEmail,
  sendInvitedEmail,
  sendShortlistedEmail,
  sendRejectedEmail,
  sendAcceptedEmail
};
