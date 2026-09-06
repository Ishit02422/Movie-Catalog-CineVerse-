import { sendOtpEmail } from "./emailService.js";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  console.log("Testing real email dispatch with .env config...");
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  const result = await sendOtpEmail({
    toEmail: "22bmiit022@gmail.com",
    otp: "859402",
    userName: "Ishita",
  });
  console.log("sendOtpEmail Result:", result);
}

run();
