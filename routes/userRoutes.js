const router = require("express").Router();
const usersController = require("../controllers/usersController");


router.get("/", usersController.fetchUser, usersController.renderUser);
router.get("/talents", usersController.fetchTalents, usersController.renderTalentList)
router.get("/register", usersController.renderRegister);
// determine whether data meets the requirements to continue to the create action
router.post(
  "/create",
  usersController.validate,
  usersController.register,
  usersController.redirectView
);
router.get("/login", usersController.login);
router.post("/login", usersController.authenticate);

router.get("/logout", usersController.logout, usersController.redirectView);
router.get("/:id", usersController.fetchUser, usersController.renderUser);
router.get("/:id/edit", usersController.renderEditInfo);
// Process data from the edit form, and display the user show page.
router.put(
  "/:id/update",
  usersController.updateUser,
  usersController.redirectView
);
router.delete(
  "/:id/delete",
  usersController.deleteUser,
  usersController.redirectView
);

router.get("/thanks", (req, res) => {
  res.render("thanks");
});


router.use(usersController.verifyJWT)

module.exports = router;
