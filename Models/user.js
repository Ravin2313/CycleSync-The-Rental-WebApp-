const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate emails
  },
  rentals: [
    {
      type: mongoose.Schema.Types.ObjectId, // References rental records
      ref: "Rental",
    },
  ],
});

// Adding passport-local-mongoose plugin for authentication
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
