const nodemailer = require("nodemailer");
const { client } = require("../db/connect");
const ejs = require("ejs");
const path = require("path");
const { formatDate } = require("../utils/dateFormating");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendEmail(
  to,
  subject,
  templateName,
  templateData,
  senderId,
  receiverId,
  attachments = []
) {
  const templatePath = path.join(__dirname, "templates", `${templateName}.ejs`);

  try {
    // Get the sender's email address
    let senderEmail;

    // If senderId is provided, get the email from the database, otherwise use the env's email
    if (senderId) {
      const senderResult = await client.query(
        `SELECT email FROM "User" WHERE id = $1`,
        [senderId]
      );
      senderEmail = senderResult.rows[0]?.email || process.env.EMAIL_USER;
      console.log("senderEmail: ", senderEmail);
    } else {
      // If senderId is null, use the default email from env
      senderEmail = process.env.EMAIL_USER;
    }

    const renderedTemplate = await ejs.renderFile(templatePath, {
      ...templateData,
      formatDate,
    });

    const mailOptions = {
      from: senderEmail, // Dynamic sender email
      to,
      subject,
      html: renderedTemplate,
      attachments: attachments,
    };

    // Set replyTo for no-reply templates
    // talents can reply to "invited" and "accepted" emails
    // For the "invited" and "accepted" emails, there is no replyTo set, meaning the reply will go to the sender's email by default.
    if (
      ["applied", "viewed", "shortlisted", "rejected"].includes(templateName)
    ) {
      mailOptions.replyTo =
        process.env.NO_REPLY_EMAIL || "no-reply@example.com";
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);

    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
}

module.exports = sendEmail;
