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
  shortlistedApplication
} = require("../controllers/hrController");



router.post("/create-job-posting", createJobPosting);
router.get("/profile", (req, res) => {
  res.render("hr/profile");
});
router.get("/talents", fetchTalents);
router.get("/my-job-postings", fetchJobPostingsByHrId);
router.get('/calendar', fetchInterviewsByHrId);

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

module.exports = router;
