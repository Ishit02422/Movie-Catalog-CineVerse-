import mongoose from "mongoose";
import { User } from "../models/User.js";

async function verifyIndexes() {
  await mongoose.connect("mongodb://127.0.0.1:27017/movie_catalog");
  console.log("Connected to MongoDB.");

  await User.init(); // Ensures indexes are created in MongoDB
  const indexes = await User.collection.getIndexes();
  console.log("Current User Collection Indexes:", Object.keys(indexes));

  const allUsers = await User.find({}, { name: 1, email: 1, phone: 1 });
  console.log("Registered Users count:", allUsers.length);
  console.log(allUsers);

  await mongoose.disconnect();
}

verifyIndexes();
