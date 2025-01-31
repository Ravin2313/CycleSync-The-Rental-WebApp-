const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Wheel = require("../Models/wheel");
const Review = require("../Models/review");
const { isLoggedIn } = require("../middleware");

// Reviews post route
router.post("/:id/reviews", isLoggedIn, async (req, res) => {
  try {
    const wheel = await Wheel.findById(req.params.id);
    if (!wheel) {
      return res.status(404).send("Wheel not found");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    wheel.reviews.push(newReview);

    await newReview.save();
    await wheel.save();
    req.flash("success", "Review posted successfully");

    console.log("New review saved");
    res.redirect(`/wheels/${req.params.id}`); // Redirect to the same show page
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Review delete route
router.delete(
  "/:reviewId",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Update the Wheel document to remove the reference to the review
    await Wheel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the Review document
    await Review.findByIdAndDelete(reviewId);

    // Redirect back to the wheel's show page
    res.redirect(`/wheels/${id}`);
  })
);

module.exports = router;
