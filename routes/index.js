const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const indexController = require("../controllers/indexController");

// GET home page.
router.get("/", indexController.homeGET);

// GET request for logging in.
router.get("/login", authController.loginGET);

// POST request for logging in.
router.post("/login", authController.loginPOST);

// GET request for signing up.
router.get("/signup", authController.signupGET);

// POST request for signing up.
router.post("/signup", authController.signupPOST);

// GET request for logging out.
router.get("/logout", authController.logoutGET);

module.exports = router;
