const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const wrapAsync = require("../utils/wrapAsync");
const Wheel = require("../Models/wheel");
const Review = require("../Models/review");
const { isLoggedIn } = require("../middleware");

// Middleware to validate ObjectId
function validateObjectId(req, res, next) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Wheel ID format");
  }
  next();
}

// Middleware to validate Review ObjectId (if needed)
function validateReviewId(req, res, next) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Review ID format");
  }
  next();
}

// All Wheels Route
router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must log in first");
    return res.redirect("/"); // Ensure the function exits after redirection
  }

  try {
    const allWheels = await Wheel.find({});
    res.render("Wheels/allWheels.ejs", { allWheels });
  } catch (err) {
    console.error("Error fetching wheels:", err);
    req.flash("error", "Something went wrong while fetching data");
    res.redirect("/");
  }
});

// New Wheel Route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("Wheels/new.ejs");
});

// Show Route (Particular Wheel Details)
router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const wheel = await Wheel.findById(id).populate({
      path: "reviews",
      populate: { path: "author" }, // Populate the `author` field in `reviews`
    });

    if (!wheel) {
      return res.status(404).send("Wheel not found");
    }
    res.render("Wheels/show.ejs", { wheel });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Create Route
router.post(
  "/",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const newWheel = new Wheel(req.body.wheel);
    await newWheel.save();
    res.redirect("/wheels");
  })
);

// Edit Route
router.get("/:id/edit", isLoggedIn, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const wheel = await Wheel.findById(id);
    if (!wheel) {
      return res.status(404).send("Wheel not found");
    }
    res.render("Wheels/edit.ejs", { wheel });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Update Route
router.put("/:id", isLoggedIn, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedWheel = await Wheel.findByIdAndUpdate(
      id,
      { ...req.body.wheel },
      { new: true }
    );
    if (!updatedWheel) {
      return res.status(404).send("Wheel not found");
    }
    res.redirect(`/wheels/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Delete Wheel Route
router.delete("/:id", isLoggedIn, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedWheel = await Wheel.findByIdAndDelete(id);
    if (!deletedWheel) {
      return res.status(404).send("Wheel not found");
    }
    res.redirect("/wheels");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Delete Review Route
router.delete(
  "/:id/reviews/:reviewId",
  isLoggedIn,
  validateReviewId,
  async (req, res) => {
    try {
      const { id, reviewId } = req.params;
      const wheel = await Wheel.findById(id);
      if (!wheel) {
        return res.status(404).send("Wheel not found");
      }
      await Review.findByIdAndDelete(reviewId);
      // Remove reference to the deleted review from the Wheel
      wheel.reviews = wheel.reviews.filter(
        (review) => review.toString() !== reviewId
      );
      await wheel.save();
      res.redirect(`/wheels/${id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
