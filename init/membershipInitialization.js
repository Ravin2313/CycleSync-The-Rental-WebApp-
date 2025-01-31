const mongoose = require("mongoose");
const membershipPlansData = require("./membershipData"); // Importing membership plans data
const MembershipPlan = require("../Models/membershipPlans"); // Ensure path is correct for MembershipPlan model

const MONGO_URL = "mongodb://127.0.0.1:27017/CycleSync";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.error("Connection error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initMembershipPlans = async () => {
  try {
    await MembershipPlan.deleteMany({}); // Clears any existing membership data
    await MembershipPlan.insertMany(membershipPlansData.data); // Inserts membership plan data

    console.log("Membership data initialized successfully");
  } catch (error) {
    console.error("Error initializing membership data:", error);
  } finally {
    mongoose.connection.close(); // Close the connection after insertion
  }
};

initMembershipPlans();
