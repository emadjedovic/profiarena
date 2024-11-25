const { client } = require("../db/connect"); // Make sure to import client
const queries = require("../db/queries"); // Import the query file
const multer = require("multer"); // If you haven't imported multer yet
const { getDateRange } = require("../utils/deadline"); // Import helper function

const updateTalent = async (req, res, next) => {
  const userId = req.params.id;

  // Access regular form data
  const {
    first_name,
    last_name,
    email,
    phone,
    address,
    date_of_birth,
    about,
    education,
    skills,
    languages,
    socials,
    projects,
  } = req.body;

  // File data (cv and certificates)
  const cvFile = req.files["cv"] ? req.files["cv"][0] : null;
  const certificatesFiles = req.files["certificates"]
    ? req.files["certificates"]
    : [];

  // Handle missing required fields
  if (!first_name || !last_name || !email) {
    req.flash("error", "First name, last name, and email are required!");
    return res.redirect(`/talents/${userId}/edit`);
  }

  // Check if a new CV file is uploaded
  const cvPath = cvFile ? cvFile.path : res.locals.currentUser.cv; // Keep the existing CV if no new file is uploaded

  // keep the existing certificates and add the new ones
  const certificatesPaths =
    certificatesFiles.length > 0
      ? [
          ...(res.locals.currentUser.certificates || []), // Existing certificates
          ...certificatesFiles.map((file) => file.path), // New certificates
        ]
      : res.locals.currentUser.certificates || [];

  // Convert string fields to arrays (split by commas and remove extra spaces)
  const parseArray = (field) => {
    return field
      ? field
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : null; // Ensure no empty values
  };

  try {
    // Update the user's information in the database
    await client.query(queries.updateTalentSQL, [
      first_name,
      last_name,
      email,
      phone || null, // If phone is empty, store null
      address || null, // If address is empty, store null
      date_of_birth || res.locals.currentUser.date_of_birth,
      about || null, // If about is empty, store null
      parseArray(education), // Convert education to array
      parseArray(skills), // Convert skills to array
      parseArray(languages), // Convert languages to array
      parseArray(socials), // Convert socials to array
      projects || null, // If projects is empty, store null
      cvPath, // Store file path of the uploaded CV
      certificatesPaths, // Store file paths of the uploaded certificates
      userId, // User ID for the WHERE clause
    ]);

    req.flash("success", "User updated successfully!");
    res.redirect(`/talent/profile`);
  } catch (error) {
    console.log(`Error updating user by ID: ${error.message}`);
    req.flash("error", `Failed to update user because: ${error.message}`);
    return next(error);
  }
};

const fs = require("fs"); // File system module

// DELETE CV
const deleteCV = async (req, res, next) => {
  const userId = req.params.id;

  try {
    // Fetch user data
    const result = await client.query('SELECT * FROM "User" WHERE id = $1', [
      userId,
    ]);
    const user = result.rows[0];

    if (!user.cv) {
      req.flash("error", "No CV found to delete!");
      return res.redirect(`/talent/profile`);
    }

    // Delete CV file from uploads folder
    const cvPath = `uploads/${user.cv}`;
    if (fs.existsSync(cvPath)) fs.unlinkSync(cvPath);

    // Update the database to remove the CV reference
    await client.query('UPDATE "User" SET cv = NULL WHERE id = $1', [userId]);

    req.flash("success", "CV deleted successfully!");
    res.redirect(`/talent/profile`);
  } catch (error) {
    console.log(`Error deleting CV: ${error.message}`);
    req.flash("error", `Failed to delete CV: ${error.message}`);
    next(error);
  }
};

// DELETE Certificate
const deleteCertificate = async (req, res, next) => {
  const userId = req.params.id;
  const certificatePath = req.body.certificatePath;

  try {
    // Fetch user data
    const result = await client.query('SELECT * FROM "User" WHERE id = $1', [
      userId,
    ]);
    const user = result.rows[0];

    if (!user.certificates || !user.certificates.includes(certificatePath)) {
      req.flash("error", "Certificate not found!");
      return res.redirect(`/talent/profile`);
    }

    // Delete certificate file from uploads folder
    const fullPath = `uploads/${certificatePath}`;
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    // Update the database to remove the specific certificate
    const updatedCertificates = user.certificates.filter(
      (cert) => cert !== certificatePath
    );
    await client.query('UPDATE "User" SET certificates = $1 WHERE id = $2', [
      updatedCertificates,
      userId,
    ]);

    req.flash("success", "Certificate deleted successfully!");
    res.redirect(`/talent/profile`);
  } catch (error) {
    console.log(`Error deleting certificate: ${error.message}`);
    req.flash("error", `Failed to delete certificate: ${error.message}`);
    next(error);
  }
};

// DELETE Social Link
const deleteSocial = async (req, res, next) => {
  const userId = req.params.id;
  const socialLink = req.body.socialLink;

  try {
    // Fetch user data
    const result = await client.query('SELECT * FROM "User" WHERE id = $1', [
      userId,
    ]);
    const user = result.rows[0];

    if (!user.socials || !user.socials.includes(socialLink)) {
      req.flash("error", "Social link not found!");
      return res.redirect(`/talent/profile`);
    }

    // Update database to remove the specific social link
    const updatedSocials = user.socials.filter((link) => link !== socialLink);
    await client.query('UPDATE "User" SET socials = $1 WHERE id = $2', [
      updatedSocials,
      userId,
    ]);

    req.flash("success", "Social link deleted successfully!");
    res.redirect(`/talent/profile`);
  } catch (error) {
    console.log(`Error deleting social link: ${error.message}`);
    req.flash("error", `Failed to delete social link: ${error.message}`);
    next(error);
  }
};

// include search (filter)
const fetchAllJobs = async (req, res, next) => {
  try {
    const { search, deadlineRange } = req.query;

    let query = `SELECT * FROM "Job_Posting"`;
    const params = [];
    let whereAdded = false; // Track if WHERE clause is already added

    // Handle search
    if (search) {
      query += `
        WHERE (
          "title" ILIKE $${params.length + 1} OR
          "company" ILIKE $${params.length + 1} OR
          "city" ILIKE $${params.length + 1} OR
          "description" ILIKE $${params.length + 1}
        )
      `;
      params.push(`%${search}%`);
      whereAdded = true; // Mark that WHERE has been added
    }

    // Handle predefined date range filtering
    if (deadlineRange) {
      const { startDate, endDate } = getDateRange(deadlineRange);

      if (startDate && endDate) {
        query += whereAdded
          ? ` AND "application_deadline" BETWEEN $${params.length + 1} AND $${
              params.length + 2
            }`
          : ` WHERE "application_deadline" BETWEEN $${params.length + 1} AND $${
              params.length + 2
            }`;
        params.push(startDate, endDate);
      } else if (!startDate && endDate) {
        // Handle "past" case where only endDate exists
        query += whereAdded
          ? ` AND "application_deadline" < $${params.length + 1}`
          : ` WHERE "application_deadline" < $${params.length + 1}`;
        params.push(endDate);
      }
    }

    // Execute the query
    const result = await client.query(query, params);

    // Render the response
    res.render("talent/allJobs", {
      allJobs: result.rows,
      searchQuery: search || "",
      deadlineRange: deadlineRange || "",
    });
  } catch (error) {
    console.error(`Error fetching all jobs: ${error.message}`);
    next(error);
  }
};

const fetchMyApplications = async (req, res, next) => {
  try {
    // Query to fetch applications with job titles and statuses
    const result = await client.query(
      `SELECT a.id AS application_id,
              a.job_posting_id,
              a.cv,
              a.cover_letter,
              a.projects,
              a.certificates, 
              jp.title AS job_title, 
              as_table.status_desc AS application_status, 
              a.submitted_at
       FROM "Application" AS a
       JOIN "Job_Posting" AS jp ON a.job_posting_id = jp.id
       JOIN "Application_Status" AS as_table ON a.application_status_id = as_table.id
       WHERE a.talent_id = $1`,
      [res.locals.currentUser.id]
    );

    res.render("talent/myApplications", { myApplications: result.rows });
  } catch (error) {
    console.error(`Error fetching applications: ${error.message}`);
    next(error);
  }
};

const fetchJob = async (req, res, next) => {
  try {
    const result = await client.query(
      'SELECT * FROM "Job_Posting" WHERE id = $1',
      [req.params.id]
    );
    const status = await client.query(
      'SELECT status_table.status_desc FROM "Application_Status" as status_table JOIN "Application" as a ON status_table.id=a.application_status_id WHERE a.job_posting_id=$1 AND a.talent_id = $2',
      [req.params.id, req.user.id]
    );
    const statusDesc =
      status.rows.length > 0
        ? status.rows[0].status_desc
        : "No status available";

    res.render("talent/job", { job: result.rows[0], status: statusDesc });
  } catch (error) {
    console.log(`Error fetching job: ${error.message}`);
    next(error);
  }
};

const applyForJob = async (req, res, next) => {
  const userId = req.user.id; // Assuming the user is authenticated
  const jobId = req.params.jobId; // ID of the job the user is applying for

  try {
    // Fetch the job posting to get the required fields
    const jobPostingResult = await client.query(
      'SELECT * FROM "Job_Posting" WHERE id = $1',
      [jobId]
    );
    const jobPosting = jobPostingResult.rows[0];

    // If job posting not found or archived
    if (!jobPosting || jobPosting.is_archived) {
      req.flash("error", "Job posting not found or archived.");
      return res.redirect("/talent/browse-all-jobs");
    }

    // Insert the application into the database with the default application status of 1
    const applicationResult = await client.query(
      'INSERT INTO "Application" (talent_id, job_posting_id, application_status_id) VALUES ($1, $2, $3) RETURNING id',
      [userId, jobId, 1]
    );
    const applicationId = applicationResult.rows[0].id;

    // Save the uploaded documents for the job application (CV, Cover Letter, Certificates)
    let cvPath = null;
    let coverLetterPath = null;
    let certificatesPaths = [];

    // Handle CV upload
    if (req.files.cv) {
      cvPath = req.files.cv[0].path;
    }

    // Handle Cover Letter upload
    if (req.files.cover_letter) {
      coverLetterPath = req.files.cover_letter[0].path;
    }

    // Handle Certificates upload
    if (req.files.certificates) {
      certificatesPaths = req.files.certificates.map((file) => file.path);
    }

    // Update the application with the document paths
    await client.query(
      `UPDATE "Application"
       SET "cv" = $1, "cover_letter" = $2, "certificates" = $3
       WHERE "id" = $4`,
      [cvPath, coverLetterPath, certificatesPaths, applicationId]
    );

    req.flash("success", "Application submitted successfully!");
    res.redirect(`/talent/job/${jobId}`);
  } catch (error) {
    console.log(`Error applying for job: ${error.message}`);
    req.flash("error", `Failed to apply for the job: ${error.message}`);
    next(error);
  }
};

module.exports = {
  updateTalent,
  deleteCV,
  deleteCertificate,
  deleteSocial,
  fetchAllJobs,
  fetchMyApplications,
  fetchJob,
  applyForJob,
};
