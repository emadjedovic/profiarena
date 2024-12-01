const { client } = require("../db/connect");
const { sendEmail } = require("./emailService");

// Start listening to PostgreSQL notifications
const listenForEmailNotifications = async () => {
  try {
    // Listen for notifications on "email_channel"
    client.on("notification", async (msg) => {
      const payload = JSON.parse(msg.payload);

      const {
        interview_id,
        application_id,
        proposed_time,
        talent_id,
        hr_id,
        is_online,
        city,
        street_address,
      } = payload;

      // Fetch email addresses from the database
      const resTalent = await client.query(
        'SELECT email FROM "User" WHERE id = $1',
        [talent_id]
      );
      const resHR = await client.query(
        'SELECT email FROM "User" WHERE id = $1',
        [hr_id]
      );
      const talentEmail = resTalent.rows[0]?.email;
      const hrEmail = resHR.rows[0]?.email;

      // Construct email content
      const subject = "Interview Scheduled";
      const text = is_online
        ? `Your interview is scheduled for ${proposed_time} online.`
        : `Your interview is scheduled for ${proposed_time} at ${city}, ${street_address}.`;

      // Send email to the talent
      await sendEmail(
        talentEmail,
        subject,
        text,
        hr_id,
        talent_id,
        interview_id
      );

      // Optionally send a copy to HR
      await sendEmail(
        hrEmail,
        `Copy: ${subject}`,
        text,
        hr_id,
        hr_id,
        interview_id
      );
    });

    // Start listening to the channel
    await client.query("LISTEN email_channel");
    console.log("Listening for email notifications...");
  } catch (error) {
    console.error("Error listening to email notifications:", error.message);
    throw error;
  }
};

module.exports = { listenForEmailNotifications };
