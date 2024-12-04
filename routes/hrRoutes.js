const router = require("express").Router();
const {
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
  updateInterview,
  deleteInterview,
  createInterviewCalendar,
} = require("../controllers/hrController");

router.post("/create-job-posting", createJobPosting);
router.get("/profile", (req, res) => {
  res.render("hr/profile");
});
router.get("/talents", fetchTalents);
router.get("/my-job-postings", fetchJobPostingsByHrId);
router.get("/calendar", fetchInterviewsByHrId);

router.post("/interviews", createInterviewCalendar);
router.put("/interviews/:id", updateInterview);
router.delete("/interviews/:id", deleteInterview);

router.get("/job-posting/:id", fetchJobPostingById);
router.post("/toggle-archive-job/:id", toggleArchiveJob);
router.get("/talent/:id", fetchTalentById);
router.get("/application/:id", fetchApplicationById);

router.put("/:id/update", updateHR);
router.get("/:id/edit", (req, res) => {
  res.render("hr/edit");
});

router.get("/app-score-form/:applicationId", showAppScoreForm);
router.post("/create-app-score/:applicationId", createAppScore);
router.post("/add-comment/:appScoreId", addComment);

router.get("/schedule-interview-form/:applicationId", showInterviewForm);
router.post("/create-interview/:applicationId", createInterview);

router.post("/accept-application/:applicationId", acceptApplication);
router.post("/reject-application/:applicationId", rejectApplication);
router.post("/shortlist-application/:applicationId", shortlistedApplication);

const { getReportsPage, generatePDF } = require("../controllers/pdfController");
const {
  getStatisticsData,
  getJobPostingAnalysis,
} = require("../controllers/statisticsController");

router.get("/reports", getReportsPage);
router.get("/reports/generate/:jobPostingId", generatePDF);

router.get("/statistics", getStatisticsData);
router.get("/job-posting-analysis/:jobPostingId", getJobPostingAnalysis);

module.exports = router;
