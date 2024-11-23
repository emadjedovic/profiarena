const router = require("express").Router()

const errorRoutes = require("./errorRoutes")
const userRoutes = require("./userRoutes")
const hrRoutes = require("./hrRoutes")

// order matters
router.use("/", hrRoutes);
router.use("/", userRoutes);
router.use("/", errorRoutes);

module.exports = router;