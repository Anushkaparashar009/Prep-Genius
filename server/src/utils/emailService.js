import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

const createTransporter = () => {
  if (!config.email.user || !config.email.pass) {
    console.warn('[EmailService] EMAIL_USER or EMAIL_PASS missing. Emails will be logged to console in development.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.pass, // Use a 16-character Gmail App Password
    },
  });
};

const buildEmailFooter = (unsubscribeUrl) => `
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #27272a; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
    <p style="margin: 0 0 6px 0;">PrepGenius Education Technologies • Gwalior, MP, India</p>
    <p style="margin: 0 0 6px 0;">Need help? Contact <a href="mailto:${config.email.support}" style="color: #818cf8;">${config.email.support}</a></p>
    ${
      unsubscribeUrl
        ? `<p style="margin: 0;">Don't want non-essential emails? <a href="${unsubscribeUrl}" style="color: #a1a1aa; text-decoration: underline;">Unsubscribe here</a>.</p>`
        : ''
    }
  </div>
`;

export const sendVerificationOtpEmail = async ({ to, name, otp, unsubscribeUrl }) => {
  const transporter = createTransporter();
  const subject = `${otp} is your PrepGenius verification code`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background-color: #090d16; color: #f4f4f5; padding: 32px; border-radius: 12px; border: 1px solid #27272a;">
      <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 20px;">Verify your PrepGenius email</h2>
      <p style="margin: 0 0 20px 0; color: #d4d4d8; font-size: 14px; line-height: 1.6;">
        Hi ${name || 'there'}, enter the 6-digit verification code below to activate your account. This code expires in <strong>10 minutes</strong>.
      </p>
      <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 10px; padding: 18px; text-align: center; letter-spacing: 8px; font-size: 28px; font-weight: 800; color: #a78bfa; font-family: monospace;">
        ${otp}
      </div>
      <p style="margin: 20px 0 0 0; color: #a1a1aa; font-size: 12px;">
        If you did not create a PrepGenius account, you can safely ignore this email.
      </p>
      ${buildEmailFooter(unsubscribeUrl)}
    </div>
  `;

  if (!transporter) {
    console.log(`\n[DEV EMAIL - OTP] To: ${to} | OTP: ${otp}\n`);
    return;
  }

  await transporter.sendMail({
    from: `"PrepGenius Security" <${config.email.user}>`,
    to,
    subject,
    html,
  });
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl, unsubscribeUrl }) => {
  const transporter = createTransporter();
  const subject = 'Reset your PrepGenius password';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background-color: #090d16; color: #f4f4f5; padding: 32px; border-radius: 12px; border: 1px solid #27272a;">
      <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 20px;">Password Reset Request</h2>
      <p style="margin: 0 0 20px 0; color: #d4d4d8; font-size: 14px; line-height: 1.6;">
        Hi ${name || 'there'}, we received a request to reset your PrepGenius password. Click the button below to choose a new password. This link expires in <strong>15 minutes</strong>.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px;">
          Reset Password
        </a>
      </div>
      <p style="margin: 16px 0 0 0; color: #a1a1aa; font-size: 12px; word-break: break-all;">
        Or copy this link: <a href="${resetUrl}" style="color: #818cf8;">${resetUrl}</a>
      </p>
      ${buildEmailFooter(unsubscribeUrl)}
    </div>
  `;

  if (!transporter) {
    console.log(`\n[DEV EMAIL - RESET] To: ${to} | URL: ${resetUrl}\n`);
    return;
  }

  await transporter.sendMail({
    from: `"PrepGenius Security" <${config.email.user}>`,
    to,
    subject,
    html,
  });
};