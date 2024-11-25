const router = require("express").Router();
const {
  updateTalent,
  deleteCV,
  deleteCertificate,
  deleteSocial,
  fetchAllJobs,
  fetchApplicationsByTalentId,
  fetchJob
} = require("../controllers/talentsController");
const multer = require("multer");

// Set the storage engine and destination for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // The folder where you want to store the uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Generate a unique file name
  },
});

const upload = multer({ storage: storage });

router.get("/profile", (req, res) => {
  res.render("talent/profile");
});
router.get("/my-job-postings", fetchApplicationsByTalentId);
router.get("/browse-all-jobs", fetchAllJobs);
router.get("/job/:id", fetchJob);

router.get("/:id/edit", (req, res) => {
  res.render("talent/edit");
});

// handle the multiple file inputs
router.put(
  "/:id/update",
  upload.fields([
    { name: "cv", maxCount: 1 }, // Handling CV upload
    { name: "certificates", maxCount: 5 }, // Handling certificates upload
  ]),
  updateTalent
);

router.delete("/:id/delete-cv", deleteCV);
router.delete("/:id/delete-certificate", deleteCertificate);
router.delete("/:id/delete-social", deleteSocial);

module.exports = router;
