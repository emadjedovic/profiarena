const router = require("express").Router();
const usersController = require("../controllers/usersController");

router.get(
  "/talents",
  usersController.fetchTalents,
  usersController.renderTalentList
);
module.exports = router;
