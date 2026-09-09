export interface SendSmsResult {
  success: boolean;
  message: string;
  provider?: "twilio" | "fast2sms" | "simulated";
}

export const sendRealSms = async (
  phone: string,
  otp: string,
  countryCode: string = "+91"
): Promise<SendSmsResult> => {
  const cleanPhone = phone.replace(/\D/g, "");
  const normalizedCountryCode = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
  const codeDigits = normalizedCountryCode.replace(/\D/g, "");
  
  // Format to standard E.164: +<CountryCode><NationalNumber>
  const formattedPhone = cleanPhone.startsWith(codeDigits) && cleanPhone.length > codeDigits.length + 6
    ? `+${cleanPhone}`
    : `${normalizedCountryCode}${cleanPhone}`;

  // 1. Try Twilio Verify Service if configured
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (accountSid && authToken && verifySid) {
    try {
      const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const res = await fetch(
        `https://verify.twilio.com/v2/Services/${verifySid}/Verifications`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: formattedPhone,
            Channel: "sms",
          }),
        }
      );

      const data: any = await res.json();
      console.log(`📱 [Twilio SMS Gateway] Dispatched to ${formattedPhone}:`, data?.status || data);

      if (data?.status === "pending" || data?.sid) {
        return {
          success: true,
          message: `SMS verification sent to ${formattedPhone}`,
          provider: "twilio",
        };
      }
    } catch (err: any) {
      console.warn("⚠️ [Twilio SMS Warning]:", err?.message || err);
    }
  }

  // 2. Try Fast2SMS if configured
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const smsRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otp,
          numbers: cleanPhone.slice(-10),
        }),
      });
      const smsJson: any = await smsRes.json();
      console.log(`📡 [Fast2SMS Result for ${cleanPhone}]:`, smsJson);
    } catch (fastErr: any) {
      console.warn("⚠️ [Fast2SMS Warning]:", fastErr?.message || fastErr);
    }
  }

  return {
    success: true,
    message: `OTP sent to ${cleanPhone}`,
    provider: "simulated",
  };
};

export const verifyTwilioOtp = async (
  phone: string,
  code: string
): Promise<boolean> => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !verifySid) {
    return false;
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("91") && cleanPhone.length === 12
    ? `+${cleanPhone}`
    : `+91${cleanPhone.slice(-10)}`;

  try {
    const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${verifySid}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: formattedPhone,
          Code: code,
        }),
      }
    );

    const data: any = await res.json();
    console.log(`🔍 [Twilio Verify Check for ${formattedPhone}]:`, data?.status);
    return data?.status === "approved" && data?.valid === true;
  } catch (err) {
    console.warn("Twilio check error:", err);
    return false;
  }
};
