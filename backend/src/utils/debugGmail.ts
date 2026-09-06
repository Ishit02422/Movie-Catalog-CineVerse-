import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

async function debugGmail() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS?.replace(/\s+/g, "");

  console.log("Testing SMTP connection with Google...");
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass }
  });

  try {
    await transporter.verify();
    console.log("✅ Gmail SMTP connected and verified successfully!");

    const info = await transporter.sendMail({
      from: `"CineVerse Streaming" <${user}>`,
      to: user,
      subject: `Your CineVerse One-Time Code: 549102`,
      text: `Your CineVerse verification code is 549102. Valid for 5 minutes.`,
      html: `
        <div style="background-color:#111;color:#fff;padding:24px;border-radius:8px;font-family:sans-serif;text-align:center;">
          <h2 style="color:#e50914;">CINEVERSE</h2>
          <p>Your verification code:</p>
          <h1 style="color:#fff;letter-spacing:4px;">549102</h1>
        </div>
      `
    });
    console.log("Sent info:", info.messageId, info.response);
  } catch (err) {
    console.error("SMTP Error:", err);
  }
}

debugGmail();
