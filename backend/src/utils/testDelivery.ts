import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

async function testDelivery() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const to = "22bmiit022@gmail.com";
  const otp = "729104";

  console.log("Testing with user:", user, "pass length:", pass?.length);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass?.replace(/\s+/g, ""),
    },
  });

  try {
    const verified = await transporter.verify();
    console.log("Transporter verification status:", verified);

    const info = await transporter.sendMail({
      from: `"CineVerse" <${user}>`,
      to: to,
      subject: `[CineVerse] Your Sign-In Code: ${otp}`,
      text: `Your CineVerse verification code is ${otp}. Valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #000; color: #fff; text-align: center;">
          <h1 style="color: #e50914;">CINEVERSE</h1>
          <h2>Your Verification Code</h2>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #fff;">${otp}</p>
          <p style="color: #888;">Valid for 5 minutes.</p>
        </div>
      `,
    });

    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("Full response:", info.response);
  } catch (err) {
    console.error("Delivery error:", err);
  }
}

testDelivery();
