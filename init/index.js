const express = require("express");
const app = express();
const initData = require("./data.js");
const Listing = require("../models/listings.js");
const mongoose = require("mongoose");

main()
  .then(() => {
    console.log("conncection successful with Database");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/snapstay");
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "66b30d186334cda8f121fd3d",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
