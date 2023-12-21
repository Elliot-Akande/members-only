const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

/* GET home page. */
router.get("/", function (req, res, next) {
  if (!req.user) {
    res.redirect("/login");
    return;
  }

  res.render("index", { title: "Express" });
});

/* GET login page. */
router.get("/login", function (req, res, next) {
  res.render("login", { title: "Login" });
});

/* GET signup page. */
router.get("/signup", function (req, res, next) {
  res.render("signup", { title: "Sign Up" });
});

/* POST signup page. */
router.post("/signup", [
  body("firstName", "First Name must be present")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastName", "Last Name must be present")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("username", "Username must be present")
    .trim()
    .isLength({ min: 1 })
    .custom(async (value) => {
      const user = await User.findOne({ username: value }).exec();
      if (user !== null) {
        throw new Error("Username already taken");
      }
    })
    .escape(),
  body("password", "Password must be at least 8 characters long")
    .isLength({ min: 8 })
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { firstName, lastName, username, password, confirmPassword } =
      req.body;

    if (!errors.isEmpty()) {
      res.render("signup", {
        title: "Sign Up",
        errors: errors.array(),
        user: { firstName, lastName, username, password, confirmPassword },
      });
      return;
    }

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) return next(err);
      await User.create({
        firstName,
        lastName,
        username,
        password: hashedPassword,
      });
    });

    res.redirect("/");
  }),
]);

module.exports = router;
