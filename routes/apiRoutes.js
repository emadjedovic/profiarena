const router = require("express").Router();
const usersController = require("../controllers/api/usersController");
const redirectView = require("../controllers/usersController").redirectView

// every route needs to use the verifyJWT middleware except for
// the login route, which is used to generate JWT
router.post("/login", usersController.apiAuthenticate, redirectView)
router.use(usersController.verifyJWT)

// USERS
router.get("/users", usersController.index, usersController.respondJSON);
router.post(
    "/users/create",
    usersController.createUser,
    usersController.respondJSON
  );
router.get("/users/:id", usersController.showUser, usersController.respondJSON);

module.exports = router;
