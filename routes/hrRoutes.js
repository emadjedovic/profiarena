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
  showAppScoreForm
} = require("../controllers/hrController");

router.post("/create-job-posting", createJobPosting);
router.get("/profile", (req, res) => {
  res.render("hr/profile");
});
router.get("/talents", fetchTalents);
router.get("/my-job-postings", fetchJobPostingsByHrId);

router.get("/job-posting/:id", fetchJobPostingById);
router.post("/toggle-archive-job/:id", toggleArchiveJob);
router.get("/talent/:id", fetchTalentById);
router.get("/application/:id", fetchApplicationById);

router.put("/:id/update", updateHR);
router.get("/:id/edit", (req, res) => {
  res.render("hr/edit");
});

router.get('/app-score-form/:applicationId', showAppScoreForm);
router.post('/create-app-score/:applicationId', createAppScore);


module.exports = router;
