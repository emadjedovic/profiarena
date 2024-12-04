const { client } = require("../db/connect");
const {
  sendViewedEmail,
  sendInvitedEmail,
  sendRejectedEmail,
  sendShortlistedEmail,
  sendAcceptedEmail,
} = require("../emails/emailTemplates");
const jwt = require("jsonwebtoken");

const {
  getAllApplicationsForJobSQL,
  getApplicationByIdSQL,
  setStatusSQL,
  getAppByIdSimple,
  getTalentIdSQL,
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
const interviewQueries = require("../db/queries/interviewQueries");
const { formatDate } = require("../utils/dateFormating");

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
    res.redirect("back");
  } catch (error) {
    console.log(`Error creating job posting: ${error.message}`);
    req.flash("error", "Failed to create job posting.");
    res.redirect("back");
  }
};

const fetchTalents = async (req, res, next) => {
  try {
    const result = await client.query(getAllTalentsSQL);
    res.render("hr/listTalents", { talents: result.rows });
  } catch (error) {
    console.log(`Error fetching talents: ${error.message}`);
    next(error);
  }
};

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

    let query = getJobPostingsByHrIdSQL;
    let params = [req.user.id];

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

    if (archive !== undefined && archive !== "") {
      if (archive === "true" || archive === "false") {
        query += `
          AND "is_archived" = $${params.length + 1}
        `;
        params.push(archive === "true");
      }
    }

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

    const result = await client.query(query, params);

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

    const jobPosting = await client.query(getJobPostingByIdSQL, [jobPostingId]);

    const applications = await client.query(getAllApplicationsForJobSQL, [
      jobPostingId,
    ]);

    applications.rows.forEach((application, index) => {
      application.rank = index + 1;
    });

    applications.rows.sort((a, b) => b.total_score - a.total_score);

    applications.rows.forEach((application, index) => {
      application.rank = index + 1;
    });

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
    await client.query(toggleArchiveJobSQL, [!isArchived, jobId]);
    res.redirect("back");
  } catch (error) {
    console.error(`Error toggling archive status: ${error.message}`);
    next(error);
  }
};

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
  const hr_id = req.user.id;

  try {
    const applicationResult = await client.query(getApplicationByIdSQL, [
      applicationId,
    ]);
    if (applicationResult.rows.length === 0) {
      return res.status(404).send("Application not found");
    }
    const application = applicationResult.rows[0];

    if (application.status_desc === "applied") {
      await client.query(setStatusSQL, [2, applicationId]);
      await sendViewedEmail(applicationId, application.talent_id, hr_id);
    }

    const appScoreResult = await client.query(
      getApplicationScoreByApplicationIdSQL,
      [applicationId]
    );
    const applicationScore = appScoreResult.rows[0];

    const latestInterviewResult = await client.query(
      `
      SELECT 
        i.proposed_time, 
        i.city, 
        i.street_address, 
        i.is_online,
        s.status_desc AS interview_status_desc
      FROM "Interview_Schedule" i
      JOIN "Interview_Status" s ON i.interview_status_id = s.id
      WHERE i.application_id = $1
      ORDER BY i.proposed_time DESC 
      LIMIT 1;
    `,
      [applicationId]
    );

    const latestInterview = latestInterviewResult.rows[0] || null;

    res.render("hr/application", {
      application,
      applicationScore,
      latestInterview,
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
      req.user.id,
      talent_id,
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

const generateInterviewToken = (interviewId, talentId) => {
  const payload = { interviewId, talentId };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: "24h" };
  return jwt.sign(payload, secret, options);
};

const createInterview = async (req, res) => {
  const applicationId = req.params.applicationId;
  const { proposed_time, is_online, city, street_address, review } = req.body;

  try {
    const applicationResult = await client.query(
      `SELECT talent_id FROM "Application" WHERE id = $1`,
      [applicationId]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).send("Application not found");
    }

    const talent_id = applicationResult.rows[0].talent_id;
    const hr_id = req.user.id;

    const result = await client.query(
      `INSERT INTO "Interview_Schedule" (
        "application_id", "hr_id", "talent_id", "proposed_time", "is_online", 
        "city", "street_address", "interview_status_id", "review"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 1, $8) RETURNING id`,
      [
        applicationId,
        hr_id,
        talent_id,
        proposed_time,
        is_online || false,
        city || null,
        street_address || null,
        review || null,
      ]
    );

    const interviewId = result.rows[0].id;

    const token = generateInterviewToken(interviewId, talent_id);

    const confirmationLink = `${process.env.BASE_URL}/talent/confirm-interview/${token}`;
    const rejectionLink = `${process.env.BASE_URL}/talent/reject-interview/${token}`;

    await client.query(setStatusSQL, [3, applicationId]);
    await sendInvitedEmail(
      applicationId,
      talent_id,
      hr_id,
      confirmationLink,
      rejectionLink
    );

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
  const hrId = req.user.id;

  try {
    const result = await client.query(interviewQueries.getInterviewsByHRSQL, [
      hrId,
    ]);

    console.log(result.rows); // Log the database query result

    const events = result.rows.map((interview) => {
      const event = {
        id: interview.id,
        title: `${interview.talent_first_name} ${interview.talent_last_name} - ${interview.status_desc}`,
        start: new Date(interview.proposed_time).toISOString(),
        allDay: false,
        extendedProps: {
          interview_status_id: interview.interview_status_id, // Store status in extendedProps
          application_status_id: interview.application_status_id,
          review: interview.review || "", // Add review to extendedProps
          current_proposed_time: formatDate(
            new Date(interview.proposed_time),
            "en-GB",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false, // Use 24-hour format
            }
          ), // Format date for proposed time
          isFinished:
            interview.application_status_id == 5 ||
            interview.application_status_id == 6, // Add a flag if finished
        },
      };

      // Apply custom class or background color if interview is finished (status_id = 4)
      if (interview.interview_status_id === 4) {
        event.classNames = event.classNames || [];
        event.classNames.push("finished-interview"); // Add custom class for finished interview
        event.backgroundColor = "green"; // Set background color for finished interview
        event.textColor = "white"; // Change text color to white
      }

      return event;
    });

    res.render("hr/calendar", {
      layout: "layout",
      events: JSON.stringify(events),
    });
  } catch (error) {
    console.error("Error fetching interviews:", error.message);
    res.status(500).send("An error occurred while fetching interviews.");
  }
};

const shortlistedApplication = async (req, res, next) => {
  const application_id = req.params.applicationId;
  const hr_id = req.user.id;
  try {
    await client.query(setStatusSQL, [4, application_id]);
    const result = await client.query(getAppByIdSimple, [application_id]);
    console.log(result.rows[0].talent_id);
    await sendShortlistedEmail(application_id, result.rows[0].talent_id, hr_id);
    res.redirect("back");
  } catch (error) {
    console.error(`Error shortlisting: ${error.message}`);
    next(error);
  }
};

const acceptApplication = async (req, res, next) => {
  const application_id = req.params.applicationId;
  const hr_id = req.user.id;
  try {
    await client.query(setStatusSQL, [6, application_id]);
    const result = await client.query(getAppByIdSimple, [application_id]);
    console.log(result.rows[0].talent_id);
    await sendAcceptedEmail(application_id, result.rows[0].talent_id, hr_id);
    res.redirect("back");
  } catch (error) {
    console.error(`Error accepting application: ${error.message}`);
    next(error);
  }
};

const rejectApplication = async (req, res, next) => {
  const application_id = req.params.applicationId;
  const hr_id = req.user.id;
  try {
    await client.query(setStatusSQL, [5, application_id]);
    const result = await client.query(getAppByIdSimple, [application_id]);
    console.log(result.rows[0].talent_id);
    await sendRejectedEmail(application_id, result.rows[0].talent_id, hr_id);
    res.redirect("back");
  } catch (error) {
    console.error(`Error rejecting application: ${error.message}`);
    next(error);
  }
};

const createInterviewCalendar = async (req, res) => {
  const { application_id, proposed_time, is_online, city, street_address } =
    req.body;
  const hr_id = req.user.id;

  try {
    // Get the talent_id from the Application table
    const talentResult = await client.query(
      'SELECT talent_id FROM "Application" WHERE id = $1 LIMIT 1;',
      [application_id]
    );

    if (talentResult.rows.length === 0) {
      console.error("Talent not found for the given application");
      return res.status(404).send("Talent not found for the given application");
    }

    const talent_id = talentResult.rows[0].talent_id;

    // Insert interview into the database
    const insertResult = await client.query(
      interviewQueries.createInterviewScheduleSQL,
      [
        application_id,
        hr_id,
        talent_id,
        proposed_time,
        is_online,
        city,
        street_address,
      ]
    );

    const newInterview = insertResult.rows[0];

    // Fetch additional details for the new interview (e.g., talent name and status description)
    const talentNameResult = await client.query(
      'SELECT first_name, last_name FROM "User" WHERE id = $1',
      [talent_id]
    );

    const interviewStatusResult = await client.query(
      'SELECT status_desc FROM "Interview_Status" WHERE id = $1',
      [newInterview.interview_status_id]
    );

    const talent = talentNameResult.rows[0];
    const status = interviewStatusResult.rows[0];

    // Include additional details in the response
    newInterview.talent_first_name = talent.first_name;
    newInterview.talent_last_name = talent.last_name;
    newInterview.status_desc = status.status_desc;

    const token = generateInterviewToken(newInterview.id, talent_id);

    const confirmationLink = `${process.env.BASE_URL}/talent/confirm-interview/${token}`;
    const rejectionLink = `${process.env.BASE_URL}/talent/reject-interview/${token}`;

    await client.query(setStatusSQL, [3, application_id]);
    await sendInvitedEmail(
      application_id,
      talent_id,
      hr_id,
      confirmationLink,
      rejectionLink
    );

    return res.json(newInterview); // Send the new interview data back
  } catch (err) {
    console.error("Error adding interview:", err.message);
    return res.status(500).send("Error adding interview: " + err.message);
  }
};

const updateInterview = async (req, res) => {
  console.log("PUT request received for update interview");
  const { id } = req.params;
  const {
    interview_status_id,
    review,
    proposed_time,
    application_status_id,
    message_to_talent,
  } = req.body;

  try {
    // Update the interview in the database
    await client.query(
      `
      UPDATE "Interview_Schedule"
      SET 
        interview_status_id = COALESCE($1, interview_status_id), 
        review = $2, 
        proposed_time = COALESCE($3, proposed_time), 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4;
      `,
      [interview_status_id, review, proposed_time, id]
    );

    // Get associated application_id
    const intResult = await client.query(
      `
    SELECT 
      "application_id", 
      (SELECT "application_status_id" FROM "Application" WHERE "id" = "Interview_Schedule"."application_id") AS current_application_status_id,
      (SELECT "talent_id" FROM "Application" WHERE "id" = "Interview_Schedule"."application_id") AS talent_id
    FROM "Interview_Schedule" 
    WHERE "id" = $1;
  `,
      [id]
    );
    const {
      application_id: applicationId,
      current_application_status_id,
      talent_id: talentId,
    } = intResult.rows[0];

    if (application_status_id === "5") {
      await sendRejectedEmail(applicationId, talentId, req.user.id);
      console.log("Rejected email sent");
    }

    if (application_status_id === "6") {
      await sendAcceptedEmail(applicationId, talentId, req.user.id);
      console.log("Accepted email sent");
    }

    // Determine the application_status_id to use
    const finalApplicationStatusId =
      application_status_id && application_status_id !== ""
        ? application_status_id
        : current_application_status_id;

    console.log("before update app query", [
      finalApplicationStatusId,
      message_to_talent,
      applicationId,
    ]);

    // Update the Application table
    await client.query(
      `
  UPDATE "Application"
  SET "application_status_id" = $1, "message_to_talent" = $2
  WHERE "id" = $3
`,
      [finalApplicationStatusId, message_to_talent, applicationId]
    );

    console.log("after update app query");

    // Fetch the updated interview data from the database
    const result = await client.query(
      `
      SELECT id, application_id, proposed_time, is_online, city, street_address, interview_status_id, review
      FROM "Interview_Schedule"
      WHERE id = $1;
    `,
      [id]
    );

    console.log("before const updatedInterview");

    const updatedInterview = result.rows[0];

    if (updatedInterview) {
      res.json(updatedInterview);
    } else {
      res.status(404).send("Interview not found");
    }
  } catch (err) {
    console.error("Error updating interview:", err.message);
    res.status(500).send("Error updating interview");
  }
};

// FIX THIS MAYBE
const deleteInterview = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the interview from the database
    await client.query('DELETE FROM "Interview_Schedule" WHERE id = $1;', [id]);

    // Fetch updated events to render in the calendar
    const result = await client.query(`
      SELECT id, application_id, proposed_time, is_online, city, street_address 
      FROM "Interview_Schedule";
    `);

    const events = result.rows;

    res.render("hr/calendar", { events });
  } catch (err) {
    console.error("Error deleting interview:", err.message);
    res.status(500).send("Error deleting interview");
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
  fetchInterviewsByHrId,
  acceptApplication,
  rejectApplication,
  shortlistedApplication,
  createInterviewCalendar,
  updateInterview,
  deleteInterview,
};
