const router = require("express").Router();
const { updateTalent } = require("../controllers/talentsController");
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

module.exports = router;
