const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: {
    type: String,
    required: true, // Ensures a comment is provided
    trim: true, // Removes extra spaces
  },
  rating: {
    type: Number,
    min: 1, // Minimum allowed value
    max: 5, // Maximum allowed value
    required: true, // Ensures a rating is provided
  },
  createdAt: {
    type: Date, // Specifies the field type as Date
    default: Date.now, // Default value is the current timestamp
  },
  author: {
    type: Schema.Types.ObjectId, // Stores an ObjectId reference
    ref: "User", // References the "User" model
    required: true, // Ensures an author is associated with the review
  },
});

module.exports = mongoose.model("Review", reviewSchema);
