const { client } = require("../db/connect"); // Make sure to import client
const queries = require("../db/queries"); // Import the query file

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
    await client.query(queries.createJobPostingSQL, [
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
    res.redirect("back"); // Redirect to a success page or the home page
  } catch (error) {
    console.log(`Error creating job posting: ${error.message}`);
    req.flash("error", "Failed to create job posting.");
    res.redirect("back"); // Redirect back to home or another page on failure
  }
};

// Fetch all users
const fetchTalents = async (req, res, next) => {
  try {
    const result = await client.query(queries.getAllTalentsSQL);
    res.render("hr/listTalents", { talents: result.rows });
  } catch (error) {
    console.log(`Error fetching talents: ${error.message}`);
    next(error);
  }
};

// filters and search bar included
const fetchJobPostingsByHrId = async (req, res, next) => {
  try {
    const {
      search,
      archive,
      cv_field,
      projects_field,
      certificates_field,
      cover_letter_field,
    } = req.query;

    // Base query to fetch job postings
    let query = queries.getJobPostingsByHrIdSQL;
    let params = [req.user.id];

    // Add search condition (search in title, company, city, description, street address)
    if (search) {
      query += `
        AND (
          "title" ILIKE $2 OR
          "company" ILIKE $2 OR
          "city" ILIKE $2 OR
          "description" ILIKE $2 OR
          "street_address" ILIKE $2
        )
      `;
      params.push(`%${search}%`);
    }

    // Add archive condition
    if (archive !== undefined && archive !== "") {
      if (archive === "true" || archive === "false") {
        query += `
          AND "is_archived" = $${params.length + 1}
        `;
        params.push(archive === "true");
      }
    }

    // Add filters for each document field if checked
    if (cv_field) {
      query += `
        AND "cv_field" = TRUE
      `;
    }
    if (projects_field) {
      query += `
        AND "projects_field" = TRUE
      `;
    }
    if (certificates_field) {
      query += `
        AND "certificates_field" = TRUE
      `;
    }
    if (cover_letter_field) {
      query += `
        AND "cover_letter_field" = TRUE
      `;
    }

    // Execute the query
    const result = await client.query(query, params);

    // Render the job postings page with the results
    res.render("hr/jobsByHrId", {
      jobPostings: result.rows,
      searchQuery: search || "",
      archiveFilter: archive || "",
      cvFieldChecked: cv_field === "on",
      projectsFieldChecked: projects_field === "on",
      certificatesFieldChecked: certificates_field === "on",
      coverLetterFieldChecked: cover_letter_field === "on",
    });
  } catch (error) {
    console.log(`Error fetching job postings by HR ID: ${error.message}`);
    next(error);
  }
};

const fetchJobPostingById = async (req, res, next) => {
  try {
    const result = await client.query(queries.getJobPostingByIdSQL, [
      req.params.id,
    ]);
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
    await client.query(queries.toggleArchiveJobSQL, [!isArchived, jobId]);
    res.redirect("back");
  } catch (error) {
    console.error(`Error toggling archive status: ${error.message}`);
    next(error);
  }
};

// Update a user
const updateHR = async (req, res, next) => {
  const userId = req.params.id;

  const { first_name, last_name, email, company_name } = req.body;
  console.log("req.body: ", req.body);

  if (!first_name || !last_name || !email) {
    req.flash("error", "First name, last name, and email are required!");
    return res.redirect(`/hr/${userId}/edit`);
  }

  try {
    await client.query(queries.updateHRSQL, [
      first_name,
      last_name,
      email,
      company_name,
      userId,
    ]); // Use the query from queries.js

    req.flash("success", "User updated successfully!");
    res.redirect(`/hr/profile`);
  } catch (error) {
    console.log(`Error updating HR: ${error.message}`);
    req.flash("error", `Failed to update user because: ${error.message}`);
    return next(error);
  }
};

const fetchTalentById = async (req, res, next) => {
  try {
    const result = await client.query(queries.getTalentByIdSQL);
    res.render("hr/talent", { talent: result.rows[0] });
  } catch (error) {
    console.log(`Error fetching talent: ${error.message}`);
    next(error);
  }
};

module.exports = {
  createJobPosting,
  fetchTalents,
  fetchJobPostingsByHrId,
  fetchJobPostingById,
  toggleArchiveJob,
  updateHR,
  fetchTalentById,
};
