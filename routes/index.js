const router = require("express").Router();

const errorRoutes = require("./errorRoutes");
const talentRoutes = require("./talentRoutes");
const hrRoutes = require("./hrRoutes");
const userRoutes = require("./userRoutes");
const apiRoutes = require("./apiRoutes");

router.use("/hr", hrRoutes);
router.use("/talent", talentRoutes);
router.use("/api", apiRoutes);
router.use("/", userRoutes);
router.use("/", errorRoutes);

module.exports = router;
