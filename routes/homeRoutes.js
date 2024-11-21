const router = require("express").Router()
const homeController = require("../controllers/homeController");

router.get("/", homeController.showHome);
router.get("/thanks", (req, res) => {
    res.render("thanks");
  });

module.exports = router;