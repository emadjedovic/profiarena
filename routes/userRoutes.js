const router = require("express").Router();
const {
  register,
  fetchUser,
  updateUser,
  deleteUser,
  authenticate,
  logout,
  renderEditUser,
  verifyJWT,
} = require("../controllers/usersController");

router.get("/home", (req, res) => {
  res.render("home");
});
router.get("/profile", (req, res) => {
  res.render("profile");
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
router.get("/:id", fetchUser);
router.get("/:id/edit", renderEditUser);
router.put("/:id/update", updateUser);
router.delete("/:id/delete", deleteUser);
router.get("/thanks", (req, res) => {
  res.render("thanks");
});

router.use(verifyJWT);

module.exports = router;
