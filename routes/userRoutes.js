const router = require("express").Router();
const usersController = require("../controllers/usersController");

// When usersController.index completes your query and adds your data
// to the res object, indexView is called to render the view.
router.get("/", usersController.index, usersController.indexView);
router.get("/new", usersController.newUser);
// determine whether data meets the requirements to continue to the create action
router.post(
  "/create",
  usersController.validate,
  usersController.createUser,
  usersController.redirectView
);
router.get("/login", usersController.login);
router.post("/login", usersController.authenticate);
router.get("/logout", usersController.logout, usersController.redirectView);
router.get("/:id", usersController.showUser, usersController.showView);
router.get("/:id/edit", usersController.showEdit);
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

module.exports = router;
