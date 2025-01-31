const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
  wheelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wheel",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User schema
    ref: "User",
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  rentalDays: {
    type: Number,
    required: true,
  },
  pickupDate: {
    type: Date,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: false,
  },
  rentedOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Rental", rentalSchema);
