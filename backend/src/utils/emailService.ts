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
  const recipient = toEmail.trim().toLowerCase();
  const relayUrl = (
    process.env.GMAIL_RELAY_URL ||
    process.env.GOOGLE_SCRIPT_URL ||
    ""
  ).trim();

  const smtpUser = (
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    "22bmiit022@gmail.com"
  ).trim();
  const smtpPass = (
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS ||
    "cltzytxjrotbgoux"
  )
    .replace(/\s+/g, "")
    .trim();

  console.log(`🚀 [Email Service] Dispatching OTP [${otp}] to ${recipient}...`);

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0b; color: #ffffff; padding: 40px 20px; text-align: center;">
      <div style="max-width: 520px; margin: 0 auto; background: #161616; border-radius: 16px; padding: 36px 28px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 12px 40px rgba(0,0,0,0.8);">
        
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: -1px; color: #ffffff;">Cine<span style="color: #E50914;">Verse</span></span>
        </div>

        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 10px; color: #ffffff;">Your Verification Code</h2>
        <p style="font-size: 14px; color: #a3a3a3; line-height: 1.6; margin-bottom: 24px;">
          Hello <strong style="color: #fff;">${userName}</strong>, use the one-time passcode below to complete your CineVerse sign in or registration.
        </p>

        <div style="background: rgba(229, 9, 20, 0.12); border: 2px dashed #E50914; border-radius: 12px; padding: 18px 24px; display: inline-block; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #ffffff; font-family: monospace;">${otp}</span>
        </div>

        <p style="font-size: 13px; color: #888888; margin-bottom: 8px;">
          ⏳ This verification code expires in <strong>5 minutes</strong>.
        </p>
        <p style="font-size: 12px; color: #555555; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
          If you did not request this verification code, please ignore this email.
        </p>
      </div>
    </div>
  `;

  // =========================================================================
  // STRATEGY 1: HTTPS REST Relay / Google Apps Script (Port 443 - Never blocked on Render)
  // =========================================================================
  if (relayUrl) {
    try {
      console.log(`🌐 [Email Service] Sending via HTTPS Relay [${relayUrl.substring(0, 35)}...]`);
      const response = await fetch(relayUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipient,
          otp: otp,
          userName: userName,
          subject: `Your CineVerse verification code: ${otp}`,
          html: htmlContent,
        }),
      });

      const data: any = await response.json().catch(() => ({}));
      if (response.ok && data.success !== false) {
        console.log(`✅ [Email Service] Successfully sent via HTTPS Relay to ${recipient}!`);
        return true;
      }
      console.warn(`⚠️ [Email Service] HTTPS Relay returned warning:`, data);
    } catch (relayErr: any) {
      console.warn(`⚠️ [Email Service] HTTPS Relay failed (${relayErr.message}). Trying SMTP fallback...`);
    }
  }

  // =========================================================================
  // STRATEGY 2: Direct IPv4 SSL Port 465 SMTP
  // =========================================================================
  const mailOptions = {
    from: `"CineVerse Streaming" <${smtpUser}>`,
    to: recipient,
    subject: `Your CineVerse verification code: ${otp}`,
    text: `Your CineVerse verification code is ${otp}. Valid for 5 minutes.`,
    html: htmlContent,
  };

  try {
    const transporter465 = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      family: 4,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
      tls: { rejectUnauthorized: false },
    } as any);

    const info = await transporter465.sendMail(mailOptions);
    console.log(`✅ [Email Service] Success via SMTP 465 to ${recipient}. MessageId: ${info.messageId}`);
    return true;
  } catch (err465: any) {
    console.warn(`⚠️ [Email Service] SMTP 465 failed (${err465.message}). Trying Port 587...`);
  }

  // =========================================================================
  // STRATEGY 3: IPv4 STARTTLS Port 587 SMTP
  // =========================================================================
  try {
    const transporter587 = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      family: 4,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
      tls: { rejectUnauthorized: false },
    } as any);

    const info = await transporter587.sendMail(mailOptions);
    console.log(`✅ [Email Service] Success via SMTP 587 to ${recipient}. MessageId: ${info.messageId}`);
    return true;
  } catch (err587: any) {
    console.warn(`⚠️ [Email Service] SMTP 587 failed (${err587.message}). Trying Service Gmail...`);
  }

  // =========================================================================
  // STRATEGY 4: Service Gmail fallback
  // =========================================================================
  try {
    const transporterGmail = nodemailer.createTransport({
      service: "gmail",
      family: 4,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 5000,
      socketTimeout: 8000,
    } as any);

    const info = await transporterGmail.sendMail(mailOptions);
    console.log(`✅ [Email Service] Success via Service Gmail to ${recipient}. MessageId: ${info.messageId}`);
    return true;
  } catch (errGmail: any) {
    console.error(`❌ [Email Service] All SMTP attempts timed out/failed on cloud server for ${recipient}: ${errGmail.message}`);
    return false;
  }
};
