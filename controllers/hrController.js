const { client } = require("../db/db_connect"); // Make sure to import client
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
    const result = await client.query(userQueries.fetchAllUsers);
    res.locals.users = result.rows;
    next();
  } catch (error) {
    console.log(`Error fetching users: ${error.message}`);
    next(error);
  }
};

// Render the talent list
const renderTalentList = (req, res) => {
  res.render("listTalents");
};

module.exports = {
  createJobPosting,
  fetchTalents,
  renderTalentList,
};
