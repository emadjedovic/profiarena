const router = require("express").Router();
const {
  register,
  deleteUser,
  authenticate,
  logout,
  verifyJWT,
} = require("../controllers/usersController");


router.get("/home", (req, res) => {
  res.render("home");
});

router.get("/register", (req, res) => {
  res.render("register");
});
router.post(
  "/register",
  register
);
router.get("/login", (req, res) => {
  res.render("login");
});
router.post("/login", authenticate);
router.get("/logout", logout);

router.delete("/:id/delete", deleteUser);

router.use(verifyJWT);

module.exports = router;
