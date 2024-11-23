const router = require("express").Router();
const {
  createJobPosting,
  fetchTalents,
  fetchJobPostingsByHrId,
  fetchJobPostingById
} = require("../controllers/hrController");

router.post("/create-job-posting", createJobPosting);
router.get("/job-posting/:id", fetchJobPostingById)
router.get("/my-job-postings", fetchJobPostingsByHrId);
router.get("/talents", fetchTalents);

module.exports = router;
