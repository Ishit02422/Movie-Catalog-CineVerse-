import mongoose from "mongoose";
import { Otp } from "../models/Otp.js";

async function checkOtps() {
  await mongoose.connect("mongodb://127.0.0.1:27017/movie_catalog");
  const otps = await Otp.find({});
  console.log("Active OTPs in DB:", otps);
  await mongoose.disconnect();
}

checkOtps();
