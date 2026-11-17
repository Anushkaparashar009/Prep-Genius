import { config } from '../config/env.js';

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

const sendMailUnified = async ({ to, toName, subject, html }) => {
  const apiKey = (config.email?.brevoApiKey || process.env.BREVO_API_KEY || '').trim();
  const senderEmail = (config.email?.user || process.env.EMAIL_USER || '').trim();

  if (!apiKey) {
    throw new Error('Server config error: BREVO_API_KEY is missing in Render Environment Variables.');
  }

  if (!senderEmail) {
    throw new Error('Server config error: EMAIL_USER is missing in Render Environment Variables.');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: 'PrepGenius Security',
        email: senderEmail,
      },
      to: [{ email: to, name: toName || to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  console.log(`[EmailService] Delivered via Brevo HTTPS API to ${to} (messageId: ${data.messageId})`);
};

export const sendVerificationOtpEmail = async ({ to, name, otp, unsubscribeUrl }) => {
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

  await sendMailUnified({ to, toName: name, subject, html });
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl, unsubscribeUrl }) => {
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

  await sendMailUnified({ to, toName: name, subject, html });
};