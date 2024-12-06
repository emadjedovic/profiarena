const { client } = require("../db/connect");

const getStatisticsData = async (req, res) => {
  const stats = {};
  const hrId = req.user.id;

  try {
    // Fetch all job postings for the logged-in HR user
    const jobPostingsResult = await client.query(
      `
      SELECT id, title 
      FROM "Job_Posting"
      WHERE hr_id = $1
  `,
      [hrId]
    );
    stats.jobPostings = jobPostingsResult.rows;

    // Total applications for all job postings
    const totalApplicationsResult = await client.query(
      `SELECT COUNT(*) AS total FROM "Application"`
    );
    stats.totalApplications = totalApplicationsResult.rows[0].total || 0;

    // Average candidate score for all job postings
    const avgScoreResult = await client.query(
      `SELECT AVG(total_score) AS avg_score FROM "Application_Score"`
    );
    // Ensure avgCandidateScore is always a number
stats.avgCandidateScore = parseFloat(avgScoreResult.rows[0]?.avg_score || 0);

    console.log("stats.avgCandidateScore: ", stats.avgCandidateScore);

    const applicationsPerJobResult = await client.query(`
      SELECT job_posting_id, COUNT(*) AS application_count
      FROM "Application"
      GROUP BY job_posting_id;
    `);

    // Safely assign the result to stats.applicationsPerJob
    stats.applicationsPerJob = applicationsPerJobResult.rows || [];

    // Average selection time for all applications
    const avgSelectionTimeResult = await client.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (selected_at - submitted_at)) / 3600) AS avg_time
      FROM "Application"
      WHERE selected_at IS NOT NULL;
    `);
    stats.avgSelectionTime = avgSelectionTimeResult.rows[0].avg_time
      ? parseFloat(avgSelectionTimeResult.rows[0].avg_time)
      : null; // Default to null if the value is invalid

    // Average selection time per job posting
    const avgSelectionTimePerJobResult = await client.query(`
      SELECT job_posting_id,
             AVG(EXTRACT(EPOCH FROM (selected_at - submitted_at)) / 3600) AS avg_time
      FROM "Application"
      WHERE selected_at IS NOT NULL
      GROUP BY job_posting_id;
    `);
    stats.avgSelectionTimePerJob = avgSelectionTimePerJobResult.rows;

    // Candidate quality metrics per job posting
    const avgScoresPerJobResult = await client.query(`
      SELECT a.job_posting_id,
             AVG(s.total_score) AS avg_candidate_score
      FROM "Application_Score" s
      JOIN "Application" a ON s.application_id = a.id
      GROUP BY a.job_posting_id;
    `);

    stats.avgScoresPerJob = avgScoresPerJobResult.rows; // Pass the rows to the frontend

    res.render("hr/statistics", { stats, currentPath: req.originalUrl });
  } catch (error) {
    console.error("Error fetching statistics data:", error);
    res.render("hr/statistics", {
      stats: {
        totalApplications: 0,
        avgCandidateScore: 0,
        avgSelectionTime: 0,
      },
      currentPath: req.originalUrl,
    });
  }
};

const getJobPostingAnalysis = async (req, res) => {
  const { jobPostingId } = req.params;

  try {
    const analysis = {};

    // Fetch analysis data for the specific job posting
    const applicationCountResult = await client.query(
      `
          SELECT COUNT(*) AS application_count 
          FROM "Application"
          WHERE job_posting_id = $1
      `,
      [jobPostingId]
    );
    analysis.applicationCount = parseInt(
      applicationCountResult.rows[0]?.application_count || 0,
      10
    );

    const avgScoreResult = await client.query(
      `
      SELECT AVG(s.total_score) AS avg_candidate_score 
      FROM "Application_Score" s
      JOIN "Application" a ON s.application_id = a.id
      WHERE a.job_posting_id = $1
    `,
      [jobPostingId]
    );
    analysis.avgCandidateScore = parseFloat(
      avgScoreResult.rows[0]?.avg_candidate_score || 0
    );
    console.log("analysis.avgCandidateScore: ", analysis.avgCandidateScore);

    const avgSelectionTimeResult = await client.query(
      `
          SELECT AVG(EXTRACT(EPOCH FROM (selected_at - submitted_at)) / 3600) AS avg_time
          FROM "Application"
          WHERE job_posting_id = $1 AND selected_at IS NOT NULL
      `,
      [jobPostingId]
    );
    analysis.avgSelectionTime = parseFloat(
      avgSelectionTimeResult.rows[0]?.avg_time || 0
    );

    res.json(analysis);
  } catch (error) {
    console.error("Error fetching job posting analysis:", error);
    res.status(500).json({ error: "Failed to fetch analysis." });
  }
};

module.exports = {
  getStatisticsData,
  getJobPostingAnalysis,
};
