const { client } = require("../db/connect");
const sendEmail = require("./emailSetup");
const crypto = require("crypto");

const { getApplicationByIdSQL } = require("../db/queries/appQueries");
const { getUserEmailByIdSQL } = require("../db/queries/userQueries");
const { getInterviewByIdSQL } = require("../db/queries/interviewQueries");

const sendViewedEmail = async (applicationId, talentId, senderId) => {
  const result = await client.query(getApplicationByIdSQL, [applicationId]);
  const emailResult = await client.query(getUserEmailByIdSQL, [talentId]);
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

    console.log("senderId: ", senderId);

    await sendEmail(
      email,
      subject,
      templateName,
      templateData,
      senderId,
      talentId
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
  senderId,
  confirmationLink,
  rejectionLink
) => {
  try {
    const result = await client.query(getApplicationByIdSQL, [applicationId]);
    const emailResult = await client.query(getUserEmailByIdSQL, [talentId]);
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

    const interviewDetails = interviewResult.rows[0];
    let subject = `Invited for "${job_title}" at ${job_company}`;
    let templateName = "invited";

    // Generate feedback token
    const feedbackToken = crypto.randomBytes(16).toString("hex");

    // Save the token to the Application table
    await client.query(
      `UPDATE "Application" SET feedback_token = $1 WHERE id = $2`,
      [feedbackToken, applicationId]
    );

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
      feedbackToken,
    };

    await sendEmail(
      email,
      subject,
      templateName,
      templateData,
      senderId,
      talentId
    );
    console.log(`Notification email sent for interview invitation.`);
  } catch (error) {
    console.error("Error sending email:", err);
    throw err;
  }
};

const sendAppliedEmail = async (applicationId, talentId, senderId) => {
  try {
    const result = await client.query(getApplicationByIdSQL, [applicationId]);
    const emailResult = await client.query(getUserEmailByIdSQL, [talentId]);
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
      senderId,
      talentId
    );
    console.log(`Notification email sent after applying to a position.`);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};

const sendShortlistedEmail = async (applicationId, talentId, senderId) => {
  try {
    const result = await client.query(getApplicationByIdSQL, [applicationId]);
    const emailResult = await client.query(getUserEmailByIdSQL, [talentId]);
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
      senderId,
      talentId
    );
    console.log(`Notification email sent for shortlisted status.`);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};

const sendRejectedEmail = async (applicationId, talentId, senderId) => {
  try {
    const result = await client.query(getApplicationByIdSQL, [applicationId]);
    const emailResult = await client.query(getUserEmailByIdSQL, [talentId]);
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
      senderId,
      talentId
    );
    console.log(`Notification email sent for rejected status.`);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};

const sendAcceptedEmail = async (applicationId, talentId, senderId) => {
  try {
    const appResult = await client.query(getApplicationByIdSQL, [
      applicationId,
    ]);
    const emailResult = await client.query(getUserEmailByIdSQL, [talentId]);
    const email = emailResult.rows[0].email;

    if (appResult.rows.length === 0) {
      console.error("Application not found or invalid status.");
      return;
    }

    const { first_name, last_name, job_title, job_company, message_to_talent } =
      appResult.rows[0];

    console.log("Message to talent: ", message_to_talent);

    let subject = `Accepted for "${job_title}" at ${job_company}`;
    let templateName = "accepted";

    // Generate feedback token
    const feedbackToken = crypto.randomBytes(16).toString("hex");

    // Save the token to the Application table
    await client.query(
      `UPDATE "Application" SET feedback_token = $1 WHERE id = $2`,
      [feedbackToken, applicationId]
    );

    let templateData = {
      applicationId,
      first_name,
      last_name,
      job_title,
      job_company,
      feedbackToken,
      message_to_talent,
    };

    await sendEmail(
      email,
      subject,
      templateName,
      templateData,
      senderId,
      talentId
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
  sendAcceptedEmail,
};
