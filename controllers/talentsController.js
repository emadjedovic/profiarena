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
    console.log(`Error updating talent: ${error.message}`);
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
    const result = await client.query(queries.getUserByIdSQL, [userId]);
    const user = result.rows[0];

    if (!user.cv) {
      req.flash("error", "No CV found to delete!");
      return res.redirect(`/talent/profile`);
    }

    // Delete CV file from uploads folder
    const cvPath = `uploads/${user.cv}`;
    if (fs.existsSync(cvPath)) fs.unlinkSync(cvPath);

    // Update the database to remove the CV reference
    await client.query(queries.deleteCVSQL, [userId]);

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
    const result = await client.query(queries.getUserByIdSQL, [userId]);
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
    await client.query(queries.setCertificatesSQL, [
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
    const result = await client.query(queries.getUserByIdSQL, [userId]);
    const user = result.rows[0];

    if (!user.socials || !user.socials.includes(socialLink)) {
      req.flash("error", "Social link not found!");
      return res.redirect(`/talent/profile`);
    }

    // Update database to remove the specific social link
    const updatedSocials = user.socials.filter((link) => link !== socialLink);
    await client.query(queries.setSocialsSQL, [updatedSocials, userId]);

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
    const userId = res.locals.currentUser.id; // Assuming the user is logged in

    if (!userId) {
      throw new Error("User must be logged in to view application statuses.");
    }

    let query = queries.getAppliedJobsSQL;
    const params = [userId];
    let whereAdded = false; // Track if WHERE clause is already added

    // Handle search
    if (search) {
      query += `
        AND (
          j."title" ILIKE $${params.length + 1} OR
          j."company" ILIKE $${params.length + 1} OR
          j."city" ILIKE $${params.length + 1} OR
          j."description" ILIKE $${params.length + 1}
        )
      `;
      params.push(`%${search}%`);
    }

    // Handle predefined date range filtering
    if (deadlineRange) {
      const { startDate, endDate } = getDateRange(deadlineRange);

      if (startDate && endDate) {
        query += `
          AND j."application_deadline" BETWEEN $${params.length + 1} AND $${params.length + 2}
        `;
        params.push(startDate, endDate);
      } else if (!startDate && endDate) {
        // Handle "past" case where only endDate exists
        query += `
          AND j."application_deadline" < $${params.length + 1}
        `;
        params.push(endDate);
      }
    }

    // Execute the query
    const result = await client.query(query, params);

    // Render the response
    res.render("talent/allJobs", {
      allJobs: result.rows, // Include `has_applied` field for each job
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
    const result = await client.query(queries.getUserApplicationsSQL, [
      res.locals.currentUser.id,
    ]);

    res.render("talent/myApplications", { myApplications: result.rows });
  } catch (error) {
    console.error(`Error fetching applications: ${error.message}`);
    next(error);
  }
};

const fetchJob = async (req, res, next) => {
  try {
    const result = await client.query(queries.getJobPostingByIdSQL, [
      req.params.id,
    ]);
    const status = await client.query(queries.getApplicationStatusSQL, [
      req.params.id,
      req.user.id,
    ]);
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
    const jobPostingResult = await client.query(queries.getJobPostingByIdSQL, [
      jobId,
    ]);
    const jobPosting = jobPostingResult.rows[0];

    // If job posting not found or archived
    if (!jobPosting || jobPosting.is_archived) {
      req.flash("error", "Job posting not found or archived.");
      return res.redirect("/talent/browse-all-jobs");
    }

    // Insert the application into the database with the default application status of 1
    const applicationResult = await client.query(queries.createApplicationSQL, [
      userId,
      jobId,
      1,
    ]);
    const applicationId = applicationResult.rows[0].id;

    // Save the uploaded documents for the job application (CV, Cover Letter, Certificates)
    let cvPath = null;
    let coverLetterPath = null;
    let certificatesPaths = [];
    let projectsText = req.body.projects || null; // Capture the Projects text

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

    await client.query(queries.setApplicationCVSQL, [cvPath, applicationId]);

    await client.query(queries.setApplicationCoverLetterSQL, [
      coverLetterPath,
      applicationId,
    ]);

    await client.query(queries.setApplicationCertificatesSQL, [
      certificatesPaths,
      applicationId,
    ]);

    await client.query(queries.setApplicationProjectsSQL, [
      projectsText,
      applicationId,
    ]);

    req.flash("success", "Application submitted successfully!");
    res.redirect(`/talent/job/${jobId}`);
  } catch (error) {
    console.log(`Error applying for job: ${error.message}`);
    req.flash("error", `Failed to apply for the job: ${error.message}`);
    next(error);
  }
};

const getJobsWithApplicationStatus = async (userId) => {
  const query = `
    SELECT j.*, 
           CASE WHEN a.talent_id IS NOT NULL THEN true ELSE false END AS has_applied
    FROM "Job_Posting" j
    LEFT JOIN "Applications" a ON j.id = a.job_posting_id AND a.talent_id = $1
  `;
  const result = await db.query(query, [userId]);
  return result.rows; // Returns jobs with `has_applied` field
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
