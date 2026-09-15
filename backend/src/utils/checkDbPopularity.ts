import mongoose from "mongoose";
import dotenv from "dotenv";
import { Movie } from "../models/Movie.js";

dotenv.config();

async function showDbData() {
  const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/movie_catalog";
  await mongoose.connect(mongoURI);

  const movies = await Movie.find({}, { title: 1, views_count: 1, rating: 1, _id: 0 }).sort({ views_count: -1 });
  console.log(`\n LIVE MOVIES DIRECTLY FROM MONGODB DATABASE (${movies.length} total):\n`);
  movies.forEach((m, i) => {
    console.log(`${(i + 1).toString().padStart(2, " ")}. ${m.title.padEnd(35, " ")} | Rating: ⭐ ${m.rating} | Views: 👁️ ${m.views_count?.toLocaleString()}`);
  });
  console.log("\n");
  await mongoose.disconnect();
}

showDbData().catch(console.error);
