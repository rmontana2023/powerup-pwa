import nodemailer from "nodemailer";

export async function sendEmailOtp(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"PowerUp Rewards" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your PowerUp OTP Code",
    html: `
      <div style="font-family:Arial,sans-serif;">
        <h2>PowerUp OTP Verification</h2>
        <p>Your one-time password is:</p>
        <h1 style="color:#ff6600;">${otp}</h1>
        <p>This code will expire in <b>10 minutes</b>.</p>
      </div>
    `,
  });
}
