const { sendEmail } = require('../emails/emailService');

// Example function to notify talent of a scheduled interview
const notifyTalent = async (req, res) => {
    const { talentId, hrId, interviewId, email, proposedTime, isOnline, city, streetAddress } = req.body;

    const subject = 'Interview Scheduled';
    const message = isOnline
        ? `Your interview is scheduled for ${proposedTime} online.`
        : `Your interview is scheduled for ${proposedTime} at ${city}, ${streetAddress}.`;

    try {
        // Send email to the talent
        await sendEmail(email, subject, message, hrId, talentId, interviewId);

        res.status(200).json({ success: true, message: 'Interview scheduled and email sent.' });
    } catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(500).json({ success: false, message: 'Failed to schedule interview.' });
    }
}


module.exports = { notifyTalent };