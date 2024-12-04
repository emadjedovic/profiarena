const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { client } = require("../db/connect");
const moment = require('moment');
const { formatDate } = require('../utils/dateFormating');
const otherQueries = require('../db/queries/otherQueries');

// Create the reports folder if it doesn't exist
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

const getReportsPage = async (req, res) => {
  // Fetch all job postings to render them in the reports page
  const result = await client.query(`
    SELECT id, title, company 
    FROM "Job_Posting" 
    WHERE is_archived = FALSE
  `);

  res.render('hr/reports', { 
    currentPath: req.originalUrl, 
    jobPostings: result.rows 
  });
};

// Helper function to get the mean selection time (in days)
const calculateMeanSelectionTime = (applications) => {
  const selectionTimes = applications
    .filter(app => app.selected_at) // Filter out applicants who were not selected
    .map(app => {
      const selectionDate = new Date(app.selected_at);
      const submittedDate = new Date(app.submitted_at);
      return (selectionDate - submittedDate) / (1000 * 60 * 60 * 24); // in days
    });

  if (selectionTimes.length === 0) return 0;
  const totalSelectionTime = selectionTimes.reduce((a, b) => a + b, 0);
  return totalSelectionTime / selectionTimes.length;
};

// Generate the PDF report for a specific job posting
const generatePDF = async (req, res) => {
  const jobPostingId = req.params.jobPostingId; // Get the job posting ID from the URL parameter
  const filePath = path.join(__dirname, '..', 'reports', `candidate-report-${jobPostingId}.pdf`); // Unique filename for each report

  console.log("PDF Path:", filePath);

  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Fetch candidate scores, ranks, and interview reviews
  const candidates = await client.query(otherQueries.getCandidateScoresAndReviewsSQL, [jobPostingId]);

  // Ensure candidates data is valid
  console.log('Candidates Data:', candidates.rows); // Log for debugging

  if (!candidates.rows.length) {
    res.status(404).send('No candidates found for this job posting');
    return;
  }

  // Remove duplicates based on email or any other unique field (e.g., ID or application_id)
  const uniqueCandidates = [];
  const seenEmails = new Set();

  candidates.rows.forEach(candidate => {
    if (!seenEmails.has(candidate.email)) {
      seenEmails.add(candidate.email);
      uniqueCandidates.push(candidate);
    }
  });

  // Sort candidates based on total score in descending order to determine rank
  uniqueCandidates.sort((a, b) => b.total_score - a.total_score); // Sort by total_score in descending order

  // Assign ranks based on sorted order
  uniqueCandidates.forEach((candidate, index) => {
    candidate.rank = index + 1; // Rank starts from 1
  });

  // Overall Report Section (calculate mean selection time and other metrics)
  const meanSelectionTime = calculateMeanSelectionTime(uniqueCandidates);
  const totalApplications = uniqueCandidates.length;
  const averageScores = calculateAverageScores(uniqueCandidates);

  // Header for the overall report
  doc.fontSize(22).font('Helvetica-Bold').text(`Candidate Applications Report for Job: ${uniqueCandidates[0]?.job_title}`, { align: 'center' });
  doc.moveDown(2); // Add some space after the title

  // Summary of the report
  doc.fontSize(14).font('Helvetica').text(`Total Applications: ${totalApplications}`);
  doc.text(`Mean Selection Time: ${meanSelectionTime.toFixed(2)} days`);
  doc.text(`Talent Quality Analysis:`);
  doc.text(`- Average Education Score: ${averageScores.educationScore.toFixed(2)}`);
  doc.text(`- Average Skills Score: ${averageScores.skillsScore.toFixed(2)}`);
  doc.text(`- Average Experience Score: ${averageScores.experienceScore.toFixed(2)}`);
  doc.text(`- Average Languages Score: ${averageScores.languagesScore.toFixed(2)}`);
  doc.text(`- Average Total Score: ${averageScores.totalScore.toFixed(2)}`);
  
  doc.moveDown(2); // Add some space before applicant details

  // Detailed Information for Each Applicant (using candidate data)
  uniqueCandidates.forEach((candidate, index) => {
    // Applicant Header
    doc.fontSize(16).font('Helvetica-Bold').text(`${index + 1}. ${candidate.first_name} ${candidate.last_name} - ${candidate.email}`);
    doc.fontSize(12).font('Helvetica').text(`Job Title: ${candidate.job_title}`);
    
    // Formatted dates
    doc.text(`Submitted At: ${formatDate(candidate.submitted_at)}`);
    doc.text(`Selected At: ${candidate.selected_at ? formatDate(candidate.selected_at) : 'N/A'}`);
    doc.text(`Rejected At: ${candidate.rejected_at ? formatDate(candidate.rejected_at) : 'N/A'}`);
    doc.text(`Application Status: ${candidate.application_status_id}`);

    // Scores Section
    if (candidate.education_score != null) {
      doc.text(`Education Score: ${candidate.education_score}`);
      doc.text(`Skills Score: ${candidate.skills_score}`);
      doc.text(`Experience Score: ${candidate.experience_score}`);
      doc.text(`Languages Score: ${candidate.languages_score}`);
      doc.text(`Certificate Score: ${candidate.certificate_score}`);
      doc.text(`Projects Score: ${candidate.projects_score}`);
      doc.text(`Cover Letter Score: ${candidate.cover_letter_score}`);
      doc.text(`Total Score: ${candidate.total_score}`);
    }

    // Rank and Interview Reviews
    doc.text(`Rank: ${candidate.rank}`);
    doc.text(`Interview Review: ${candidate.review ? candidate.review : 'No review available'}`);

    doc.moveDown(1); // Add a small gap between applicants
  });

  // End the document (and make sure the PDF file is written)
  doc.end();

  // Wait for the writeStream to finish before checking the file existence
  writeStream.on('finish', () => {
    // Check if the PDF file exists
    fs.exists(filePath, (exists) => {
      if (exists) {
        res.sendFile(filePath); // Send the PDF file for download
      } else {
        console.log("File does not exist:", filePath);
        res.status(404).send('File not found');
      }
    });
  });
};

// Helper function to calculate average scores
const calculateAverageScores = (candidates) => {
  const totalScores = {
    educationScore: 0,
    skillsScore: 0,
    experienceScore: 0,
    languagesScore: 0,
    totalScore: 0,
  };
  let count = 0;

  candidates.forEach(candidate => {
    if (candidate.education_score != null) {
      totalScores.educationScore += candidate.education_score;
      totalScores.skillsScore += candidate.skills_score;
      totalScores.experienceScore += candidate.experience_score;
      totalScores.languagesScore += candidate.languages_score;
      totalScores.totalScore += candidate.total_score;
      count++;
    }
  });

  if (count === 0) return totalScores;

  return {
    educationScore: totalScores.educationScore / count,
    skillsScore: totalScores.skillsScore / count,
    experienceScore: totalScores.experienceScore / count,
    languagesScore: totalScores.languagesScore / count,
    totalScore: totalScores.totalScore / count,
  };
};

module.exports = {
  getReportsPage,
  generatePDF
};
