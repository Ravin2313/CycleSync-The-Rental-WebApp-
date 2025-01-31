const mongoose = require("mongoose");
const initData = require("./data");
const Wheel = require("../Models/wheel");

const MONGO_URL = "mongodb://127.0.0.1:27017/CycleSync";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Wheel.deleteMany({});
  await Wheel.insertMany(initData.data);
  console.log("Data was initialized");
};

initDB();
