import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send OTP via Email
 * @param {string} email - Recipient email
 * @param {string} otp - 4-digit code
 */
export const sendOTPEmail = async (email, otp) => {
  // Fallback for development if no credentials provided
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('=======================================');
    console.log(`[REAL EMAIL MOCK] To: ${email}`);
    console.log(`[OTP CODE]: ${otp}`);
    console.log('=======================================');
    console.log('TIP: Add SMTP_USER and SMTP_PASS to .env.local to send real emails.');
    return true;
  }

  const mailOptions = {
    from: `"LOKALL Security" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${otp} is your LOKALL verification code`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0F172A; margin: 0;">LOKALL</h2>
          <p style="color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 4px 0;">Security Center</p>
        </div>
        
        <h3 style="color: #1E293B; font-size: 18px; margin-bottom: 16px;">Reset Your Password</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
          We received a request to reset the password for your LOKALL account. Use the following code to verify your identity:
        </p>
        
        <div style="background-color: #F8FAFC; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 800; color: #F97316; letter-spacing: 8px;">${otp}</span>
        </div>
        
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-bottom: 0;">
          This code will expire in 10 minutes. If you did not request this reset, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Success: OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[Email Service] Error sending mail:', error);
    throw new Error('Failed to send verification email');
  }
};
