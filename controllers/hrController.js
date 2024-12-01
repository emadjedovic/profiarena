const { client } = require("../db/connect");
const {
  sendViewedEmail,
  sendInvitedEmail,
  sendRejectedEmail,
  sendShortlistedEmail,
} = require("../emails/emailService");
const jwt = require("jsonwebtoken");

const {
  getAllApplicationsForJobSQL,
  getApplicationByIdSQL,
  setStatusSQL
} = require("../db/queries/appQueries");
const {
  addCommentSQL,
  deleteAppScoreSQL,
  getApplicationScoreByApplicationIdSQL,
  insertAppScoreSQL,
  setScoresSQL,
  setTotalScoreSQL,
} = require("../db/queries/appScoreQueries");
const {} = require("../db/queries/interviewQueries");
const {
  createJobPostingSQL,
  getJobPostingByIdSQL,
  getJobPostingsByHrIdSQL,
  toggleArchiveJobSQL,
} = require("../db/queries/jobPostingQueries");
const {
  getAllTalentsSQL,
  getTalentByIdSQL,
  updateHRSQL,
} = require("../db/queries/userQueries");
const interviewQueries = require('../db/queries/interviewQueries');

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
    await client.query(createJobPostingSQL, [
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
    const result = await client.query(getAllTalentsSQL);
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
    let query = getJobPostingsByHrIdSQL;
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
    const jobPostingId = req.params.id;

    // Fetch the job posting details
    const jobPosting = await client.query(
      getJobPostingByIdSQL,
      [jobPostingId]
    );

    // Fetch applications with their corresponding total scores
    const applications = await client.query(
      getAllApplicationsForJobSQL,
      [jobPostingId]
    );

    // Rank the applications based on total score
    applications.rows.forEach((application, index) => {
      application.rank = index + 1; // Start ranking from 1
    });

    // Sort applications by total_score in descending order to rank
    applications.rows.sort((a, b) => b.total_score - a.total_score);

    // Assign ranks to the sorted applications
    applications.rows.forEach((application, index) => {
      application.rank = index + 1; // Rank starts at 1
    });

    // Render the job posting page with the applications and ranks
    res.render("hr/jobPosting", {
      jobPosting: jobPosting.rows[0],
      applications: applications.rows,
    });
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
    await client.query(toggleArchiveJobSQL, [
      !isArchived,
      jobId,
    ]);
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

  if (!first_name || !last_name || !email) {
    req.flash("error", "First name, last name, and email are required!");
    return res.redirect(`/hr/${userId}/edit`);
  }

  try {
    await client.query(updateHRSQL, [
      first_name,
      last_name,
      email,
      company_name,
      userId,
    ]);

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
    const userId = req.params.id;
    const result = await client.query(getTalentByIdSQL, [userId]);
    res.render("hr/talent", { talent: result.rows[0] });
  } catch (error) {
    console.log(`Error fetching talent: ${error.message}`);
    next(error);
  }
};

const fetchApplicationById = async (req, res) => {
  const applicationId = req.params.id;

  try {
    // Fetch the application details
    const applicationResult = await client.query(
      getApplicationByIdSQL,
      [applicationId]
    );
    if (applicationResult.rows.length === 0) {
      return res.status(404).send("Application not found");
    }
    const application = applicationResult.rows[0];

    if (application.status_desc === "applied") {
      await client.query(setStatusSQL, [2, applicationId]);
      await sendViewedEmail(applicationId, application.talent_id);
    }

    // Fetch the application score if it exists
    const appScoreResult = await client.query(
      getApplicationScoreByApplicationIdSQL,
      [applicationId]
    );
    const applicationScore = appScoreResult.rows[0];

    res.render("hr/application", {
      application,
      applicationScore,
    });
  } catch (err) {
    console.error("Error fetching application details:", err);
    res.status(500).send("Server error");
  }
};

const createAppScore = async (req, res) => {
  const applicationId = req.params.applicationId;
  const {
    education_score,
    skills_score,
    experience_score,
    languages_score,
    certificate_score,
    projects_score,
    comments,
  } = req.body;

  // Calculate the total score (assuming the formula is correct)
  const totalScore =
    (education_score +
      skills_score +
      experience_score +
      languages_score +
      certificate_score +
      projects_score) /
    6;

  try {
    const applicationResult = await client.query(
      `SELECT talent_id FROM "Application" WHERE id = $1`,
      [applicationId]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).send("Application not found");
    }

    const talent_id = applicationResult.rows[0].talent_id;
    await client.query(deleteAppScoreSQL, [applicationId]);

    const result = await client.query(insertAppScoreSQL, [
      applicationId,
      req.user.id, // Assuming the HR user is logged in
      talent_id, // Talent ID fetched from the Application table
    ]);

    const appScoreId = result.rows[0].id;

    await client.query(setScoresSQL, [
      education_score,
      skills_score,
      experience_score,
      languages_score,
      certificate_score,
      projects_score,
      appScoreId,
    ]);

    await client.query(setTotalScoreSQL, [appScoreId]);
    await client.query(
      'UPDATE "Application_Score" SET comments=$1 WHERE id=$2',
      [comments, appScoreId]
    );

    res.redirect(`/hr/application/${applicationId}`);
  } catch (err) {
    console.error("Error submitting score:", err);
    res.status(500).send("Server error");
  }
};

const showAppScoreForm = async (req, res) => {
  const applicationId = req.params.applicationId;

  try {
    // Fetch the application details (optional, for showing title and company in the form)
    const application = await client.query(getApplicationByIdSQL, [
      applicationId,
    ]);

    if (application.rows.length === 0) {
      return res.status(404).send("Application not found");
    }

    res.render("hr/appScoreForm", {
      application: application.rows[0],
    });
  } catch (err) {
    console.error("Error fetching application:", err);
    res.status(500).send("Server error");
  }
};

const showInterviewForm = async (req, res) => {
  const applicationId = req.params.applicationId;

  try {
    // Fetch the application details (optional, for showing title and company in the form)
    const application = await client.query(getApplicationByIdSQL, [
      applicationId,
    ]);

    if (application.rows.length === 0) {
      return res.status(404).send("Application not found");
    }

    res.render("hr/interviewScheduleForm", {
      application: application.rows[0],
    });
  } catch (err) {
    console.error("Error fetching application:", err);
    res.status(500).send("Server error");
  }
};

// Generate a JWT token for the talent
const generateInterviewToken = (interviewId, talentId) => {
  const payload = { interviewId, talentId };
  const secret = process.env.JWT_SECRET; // Make sure to use a strong secret
  const options = { expiresIn: "24h" }; // Token expires in 24 hours
  return jwt.sign(payload, secret, options);
};

const createInterview = async (req, res) => {
  const applicationId = req.params.applicationId;
  const { proposed_time, is_online, city, street_address, impression } =
    req.body;

  try {
    // Step 1: Check if the application exists and fetch relevant details
    const applicationResult = await client.query(
      `SELECT talent_id FROM "Application" WHERE id = $1`,
      [applicationId]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).send("Application not found");
    }

    const talent_id = applicationResult.rows[0].talent_id;
    const hr_id = req.user.id; // Extract the HR ID from the current user's session

    // Step 2: Insert the new interview schedule with status set to "scheduled" (ID 1)
    const result = await client.query(
      `INSERT INTO "Interview_Schedule" (
        "application_id", "hr_id", "talent_id", "proposed_time", "is_online", 
        "city", "street_address", "interview_status_id", "impression"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 1, $8) RETURNING id`, // Interview status is set to "scheduled" (ID 1)
      [
        applicationId,
        hr_id,
        talent_id,
        proposed_time,
        is_online || false,
        city || null,
        street_address || null,
        impression || null,
      ]
    );

    const interviewId = result.rows[0].id;

    // Step 2: Generate the token for the talent to confirm/reject
    const token = generateInterviewToken(interviewId, talent_id);

    // Step 3: Send email to talent with the confirmation/rejection links
    const confirmationLink = `${process.env.BASE_URL}/talent/confirm-interview/${token}`;
    const rejectionLink = `${process.env.BASE_URL}/talent/reject-interview/${token}`;

    console.log("confirmation link from createInterview: ", confirmationLink);

    await client.query(setStatusSQL, [3, applicationId]);
    await sendInvitedEmail(
      applicationId,
      talent_id,
      confirmationLink,
      rejectionLink
    );

    // Step 4: Redirect to the application details page
    res.redirect(`/hr/application/${applicationId}`);
  } catch (err) {
    console.error("Error creating interview schedule:", err);
    res.status(500).send("Server error");
  }
};

const addComment = async (req, res, next) => {
  const { comment } = req.body;
  const appScoreId = req.params.appScoreId;

  try {
    // Update the comment in the Application_Score table
    await client.query(addCommentSQL, [comment, appScoreId]);
    req.flash("success", "Comment added successfully!");
    res.redirect(`back`);
  } catch (error) {
    console.log(`Error adding comment: ${error.message}`);
    req.flash("error", "Failed to add comment.");
    res.redirect("back");
  }
};

const fetchInterviewsByHrId = async (req, res) => {
  const hrId = req.user.id; // Get HR ID from request parameters

  try {
      // Fetch interviews
      const result = await client.query(interviewQueries.getInterviewsByHRSQL, [hrId]);

      // Prepare events for FullCalendar
      const events = result.rows.map(interview => ({
          title: `${interview.talent_first_name} ${interview.talent_last_name} - ${interview.status_desc}`,
          start: new Date(interview.proposed_time).toISOString(),
          allDay: false, // Set to true if the event spans the entire day
      }));

      // Render the EJS template with serialized events
      res.render('hr/calendar', {
        layout: 'layout', // Use layout.ejs
        events: JSON.stringify(events), // Serialized events
      });
      
  } catch (error) {
      console.error('Error fetching interviews:', error.message);
      res.status(500).send('An error occurred while fetching interviews.');
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
  fetchApplicationById,
  createAppScore,
  showAppScoreForm,
  addComment,
  showInterviewForm,
  createInterview,
  fetchInterviewsByHrId
};
