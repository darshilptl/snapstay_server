const express = require("express");
const router = express.Router();
// const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");
// const user = require("../models/user.js");

router
  .route("/signup")
  //signup user form
  .get(userController.renderSignupForm)

  //add user to database
  .post(wrapAsync(userController.signup));

router
  .route("/login")

  // Get route for login
  .get(userController.renderLoginForm)

  // Post route for login
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userController.login
  );

// Get route for logout
router.get("/logout", userController.logout);

// Login after signup

module.exports = router;
