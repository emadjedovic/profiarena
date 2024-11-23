const router = require("express").Router();
const { createJobPosting, fetchTalents, renderTalentList } = require("../controllers/hrController");

router.post("/create-job-posting", createJobPosting);
router.get(
    "/talents",
    fetchTalents,
    renderTalentList
  );

module.exports = router;
