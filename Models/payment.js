const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    rentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rental", // Reference to the Rental collection
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    wheelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wheel", // Reference to the Wheel collection
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Debit Card", "UPI", "Net Banking", "Cash"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending", // Default status is pending until payment is confirmed
    },
    transactionId: {
      type: String,
      unique: true,
      required: false, // Only required after payment is confirmed
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
