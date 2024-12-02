const router = require("express").Router();
const {
  updateTalent,
  deleteCV,
  deleteCertificate,
  deleteSocial,
  fetchAllJobs,
  fetchMyApplications,
  fetchJob,
  applyForJob,
  confirmInterview,
  rejectInterview,
  fetchInterviewsByTalentId
} = require("../controllers/talentsController");
const multer = require("multer");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); 
  },
});

const upload = multer({ storage: storage });

router.get("/profile", (req, res) => {
  res.render("talent/profile");
});
router.get("/my-applications", fetchMyApplications);
router.get("/browse-all-jobs", fetchAllJobs);
router.get('/calendar', fetchInterviewsByTalentId);

router.get('/confirm-interview/:token', confirmInterview);
router.get('/reject-interview/:token', rejectInterview);

/*
The files (CV, cover letter, certificates) are uploaded and processed on the server side using the multer middleware, and the relevant paths are stored in the database. The applyForJob function handles this by checking which fields are present in the request and saving the file paths to the Application record.
*/
router.post("/jobs/:jobId/apply", upload.fields([
  { name: "cv", maxCount: 1 },
  { name: "cover_letter", maxCount: 1 },
  { name: "certificates", maxCount: 5 }
]), applyForJob)

router.get("/job/:id", fetchJob);

router.get("/:id/edit", (req, res) => {
  res.render("talent/edit");
});


router.put(
  "/:id/update",
  upload.fields([
    { name: "cv", maxCount: 1 }, 
    { name: "certificates", maxCount: 5 }, 
  ]),
  updateTalent
);

router.delete("/:id/delete-cv", deleteCV);
router.delete("/:id/delete-certificate", deleteCertificate);
router.delete("/:id/delete-social", deleteSocial);

module.exports = router;
