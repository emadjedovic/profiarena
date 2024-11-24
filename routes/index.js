const router = require("express").Router()

const errorRoutes = require("./errorRoutes")
const talentRoutes = require("./talentRoutes")
const hrRoutes = require("./hrRoutes")
const userRoutes = require("./userRoutes")

// order matters
router.use("/hr", hrRoutes);
router.use("/talent", talentRoutes);
router.use("/", userRoutes);
router.use("/", errorRoutes);

router.get("/thanks", (req, res) => {
    res.render("thanks");
  });

module.exports = router;