const router = require("express").Router();
const {
  updateTalent
} = require("../controllers/talentsController");

router.get("/profile", (req, res) => {
  res.render("talent/profile");
});

router.get("/:id/edit",  (req, res) => {
  res.render("talent/edit");
});
router.put("/:id/update", updateTalent);

module.exports = router;
