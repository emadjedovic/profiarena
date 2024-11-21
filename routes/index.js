const router = require("express").Router()

const errorRoutes = require("./errorRoutes")
const userRoutes = require("./userRoutes")

// order matters
router.use("/", userRoutes);
router.use("/", errorRoutes);

module.exports = router;