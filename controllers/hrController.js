const { client } = require("../db/connect"); // Make sure to import client
const { userQueries, jobPostingQueries } = require("../db/queries"); // Import the query file

// Create Job Posting
const createJobPosting = async (req, res, next) => {
  const {
    title,
    description,
    city,
    application_deadline,
    company,
    cv_field,
    cover_letter_field,
    projects_field,
    certificates_field,
  } = req.body;

  // Insert job posting into the database
  try {
    await client.query(jobPostingQueries.createJobPosting, [
      title,
      description,
      city,
      application_deadline,
      company,
      cv_field === "1",
      cover_letter_field === "1",
      projects_field === "1",
      certificates_field === "1",
      req.user.id,
    ]);
    req.flash("success", "Job posting created successfully!");
    res.redirect("/home"); // Redirect to a success page or the home page
  } catch (error) {
    console.log(`Error creating job posting: ${error.message}`);
    req.flash("error", "Failed to create job posting.");
    res.redirect("/home"); // Redirect back to home or another page on failure
  }
};

// Fetch all users
const fetchTalents = async (req, res, next) => {
  try {
    const result = await client.query(userQueries.getAllTalents);
    res.render("hr/listTalents", { talents: result.rows });
  } catch (error) {
    console.log(`Error fetching talents: ${error.message}`);
    next(error);
  }
};

const fetchJobPostingsByHrId = async (req, res, next) => {
  try {
    const result = await client.query(jobPostingQueries.getJobPostingsByHrId, [req.user.id]);
    res.render("hr/jobsByHrId", { jobPostings: result.rows });
  } catch (error) {
    console.log(`Error fetching job postings by HR ID: ${error.message}`);
    next(error);
  }
};

const fetchJobPostingById = async (req, res, next) => {
  try {
    const result = await client.query(jobPostingQueries.getJobPostingById, [req.params.id]);
    res.render("hr/jobPosting", { jobPosting: result.rows[0] });
  } catch (error) {
    console.log(`Error fetching job posting by ID: ${error.message}`);
    next(error);
  }
};

const toggleArchiveJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const result = await client.query(
      `SELECT "is_archived" FROM "Job_Posting" WHERE "id" = $1`,
      [jobId]
    );
    const isArchived = result.rows[0].is_archived;
    await client.query(
      `UPDATE "Job_Posting" SET "is_archived" = $1 WHERE "id" = $2`,
      [!isArchived, jobId]
    );
    res.redirect('back');
  } catch (error) {
    console.error(`Error toggling archive status: ${error.message}`);
    next(error);
  }
};



module.exports = {
  createJobPosting,
  fetchTalents,
  fetchJobPostingsByHrId,
  fetchJobPostingById,
  toggleArchiveJob
};
