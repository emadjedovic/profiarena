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
    
    let senderEmail;

    
    if (senderId) {
      const senderResult = await client.query(
        `SELECT email FROM "User" WHERE id = $1`,
        [senderId]
      );
      senderEmail = senderResult.rows[0]?.email || process.env.EMAIL_USER;
      console.log("senderEmail: ", senderEmail);
    } else {
      
      senderEmail = process.env.EMAIL_USER;
    }

    const renderedTemplate = await ejs.renderFile(templatePath, {
      ...templateData,
      formatDate,
    });

    const mailOptions = {
      from: senderEmail, 
      to,
      subject,
      html: renderedTemplate,
      attachments: attachments,
    };

    
    
    
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
