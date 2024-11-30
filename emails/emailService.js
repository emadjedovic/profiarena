const nodemailer = require('nodemailer');
const { client } = require('../db/connect'); // Import existing database client

// Configure transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
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
async function sendEmail(to, subject, text, senderId, receiverId, interviewId) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        // Send email via Nodemailer
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.response}`);

        // Log email communication in the database
        await client.query(
            `INSERT INTO "Email_Communication" (interview_id, sender_id, receiver_id, subject, message)
             VALUES ($1, $2, $3, $4, $5)`,
            [interviewId, senderId, receiverId, subject, text]
        );

        return info;
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw error;
    }
}

module.exports = { sendEmail };
