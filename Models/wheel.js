const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cycleSchema = new Schema({
  cycleId: { type: String, unique: true, required: true },
  modelName: { type: String, required: true },
  type: { type: String, required: true },
  rentPrice: { type: Number, required: true },
  availabilityStatus: {
    type: String,
    enum: ["Available", "Rented"],
    default: "Available",
  },
  currentLocation: { type: String, required: true },
  image: { type: String, required: true },
  condition: { type: String, default: "Good" },
  accessories: { type: String, default: "None" },
  addedDate: { type: Date, default: Date.now },
  usageHistory: { type: Number, default: 0 },
  reviews: [
    {
      type: Schema.Types.ObjectId, // Fixed 'type' key
      ref: "Review", // Refers to the 'Review' model
    },
  ],
});

const Wheel = mongoose.model("Wheel", cycleSchema);
module.exports = Wheel;
