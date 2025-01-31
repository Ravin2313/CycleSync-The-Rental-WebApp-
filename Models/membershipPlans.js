const mongoose = require("mongoose");

const membershipPlanSchema = new mongoose.Schema({
  planId: {
    type: String,
    required: true,
    unique: true,
  },
  planName: {
    type: String,
    required: true,
  },
  duration: {
    type: String, // e.g., '1 Month', '3 Months', '1 Year'
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  benefits: {
    type: [String], // Array of benefits (e.g., ["Unlimited Rides", "Free Accessories"])
    required: true,
  },
  rideLimit: {
    type: Number, // Maximum number of rides or time per day, if applicable
    default: null, // Can be null if there is no limit
  },
  discount: {
    type: Number, // Discount percentage applicable with the plan
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update `updatedAt` field on document update
membershipPlanSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const MembershipPlan = mongoose.model("MembershipPlan", membershipPlanSchema);

module.exports = MembershipPlan;
