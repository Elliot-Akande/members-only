const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Display login form on GET.
exports.loginGET = asyncHandler(async (req, res, next) => {
  res.render("login", { title: "Login", error: req.flash("error") });
});

// Handle login on POST.
exports.loginPOST = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
});

// Display signup form on GET.
exports.signupGET = asyncHandler(async (req, res, next) => {
  res.render("signup", { title: "Sign Up" });
});

// Handle signup on POST.
exports.signupPOST = [
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
    }),
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
];

// Logout user on GET.
exports.logoutGET = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
