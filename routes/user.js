const express = require("express");
const router = express.Router();
const User = require("../Models/user");
const passport = require("passport");

// Route to render signup form
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

// Route to handle signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Create new user instance
    const newUser = new User({ email, username });

    // Register the user with passport-local-mongoose
    const registeredUser = await User.register(newUser, password);
    console.log("Registered User:", registeredUser);
    req.logIn(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", `Welcome ${registeredUser.username} to CycleSync!`);
      res.redirect("/");
    });

    // Flash success message and redirect
  } catch (err) {
    console.error("Error during signup:", err);
    req.flash("error", err.message || "Something went wrong during signup.");
    res.redirect("/signup");
  }
});

// Route to render login form
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// Route to handle login
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login", // Redirect if login fails
    failureFlash: "Invalid username or password.", // Flash message on failure
  }),
  async (req, res) => {
    try {
      // Flash success message and redirect after login
      req.flash("success", `Welcome back ${req.user.username} to CycleSync!`);
      res.redirect("/"); // Redirect to dashboard or desired route
    } catch (err) {
      console.error("Error during login:", err);
      req.flash("error", "Something went wrong during login.");
      res.redirect("/login");
    }
  }
);

router.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/");
  });
});

module.exports = router;
