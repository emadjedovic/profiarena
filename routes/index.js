const router = require("express").Router()

const errorRoutes = require("./errorRoutes")
const homeRoutes = require("./homeRoutes")
const apiRoutes = require("./apiRoutes")
const userRoutes = require("./userRoutes")

// order matters
router.use("/users", userRoutes);
router.use("/api", apiRoutes)
router.use("/", homeRoutes);
router.use("/", errorRoutes);

module.exports = router;