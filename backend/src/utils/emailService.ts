import nodemailer from "nodemailer";

interface SendOtpEmailParams {
  toEmail: string;
  otp: string;
  userName?: string;
}

export const sendOtpEmail = async ({
  toEmail,
  otp,
  userName = "Movie Lover",
}: SendOtpEmailParams): Promise<boolean> => {
  try {
    // If SMTP credentials exist in process.env, use them (e.g. Gmail App Password, Sendgrid, etc.)
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    let transporter;

    if (smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass.replace(/\s+/g, ""), // Strip any spaces from the 16-char app password
        },
      });
    } else {
      // Create a test account fallback with Ethereal if no custom SMTP provided
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #141414; color: #ffffff; padding: 40px 20px; text-align: center;">
        <div style="max-width: 520px; margin: 0 auto; background: #1f1f1f; border-radius: 12px; padding: 36px 28px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: -1px; color: #E50914;">CINE<span style="color: #ffffff;">VERSE</span></span>
          </div>

          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: #ffffff;">Your Verification Code</h2>
          <p style="font-size: 15px; color: #a3a3a3; line-height: 1.5; margin-bottom: 28px;">
            Hello <strong>${userName}</strong>, use the one-time password below to sign in or complete your registration.
          </p>

          <div style="background: rgba(229, 9, 20, 0.1); border: 2px dashed #E50914; border-radius: 10px; padding: 18px 24px; display: inline-block; margin-bottom: 28px;">
            <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #ffffff; font-family: monospace;">${otp}</span>
          </div>

          <p style="font-size: 13px; color: #737373; margin-bottom: 8px;">
            ⏳ This code is valid for <strong>5 minutes</strong>.
          </p>
          <p style="font-size: 12px; color: #525252; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
            If you did not request this verification, you can safely ignore this email.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"CineVerse Security" <${smtpUser || "auth@cineverse.local"}>`,
      to: toEmail,
      subject: `Your CineVerse verification code: ${otp}`,
      text: `Your CineVerse verification code is ${otp}. Valid for 5 minutes.`,
      html: htmlContent,
    });

    console.log(`📧 [Email Service] OTP email dispatched to ${toEmail}. MessageId: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`🔗 [Email Preview URL]: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error) {
    console.error("❌ [Email Service Error]:", error);
    return false;
  }
};
