import crypto from 'crypto';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import ChatSession from '../models/ChatSession.js';
import InterviewSession from '../models/InterviewSession.js';
import ResumeAudit from '../models/ResumeAudit.js';
import { generateToken } from '../utils/generateToken.js';
import { sendVerificationOtpEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import { config } from '../config/env.js';

const generateOtpCode = () => crypto.randomInt(100000, 999999).toString();
const hashToken = (val) => crypto.createHash('sha256').update(val).digest('hex');

const buildUnsubscribeLink = (userId) => {
  const sig = crypto
    .createHmac('sha256', config.jwtSecret)
    .update(String(userId))
    .digest('hex')
    .slice(0, 16);
  return `${config.serverUrl}/api/auth/unsubscribe/${userId}?sig=${sig}`;
};

// @desc    Register user & send Gmail OTP (Data Minimized + Age & Terms Guardrail)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, password, acceptedTerms, isOver13, marketingOptIn } = req.body;
    const email = req.body.email ? req.body.email.trim().toLowerCase() : null;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    if (acceptedTerms !== true) {
      return res.status(400).json({
        message: 'You must agree to the Terms of Service and Privacy Policy to create an account.',
      });
    }

    if (isOver13 !== true) {
      return res.status(400).json({
        message: 'Age requirement: You must confirm that you are 13 years of age or older.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const otp = generateOtpCode();
    const otpHash = hashToken(otp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user;
    if (existingUser && !existingUser.isVerified) {
      // Refresh unverified pending account
      existingUser.name = name.trim();
      existingUser.password = password;
      existingUser.otpHash = otpHash;
      existingUser.otpExpires = otpExpires;
      existingUser.consents = {
        termsAccepted: true,
        ageConfirmed13Plus: true,
        marketingOptIn: Boolean(marketingOptIn),
        consentedAt: new Date(),
      };
      user = await existingUser.save();
    } else {
      user = await User.create({
        name: name.trim(),
        email,
        password,
        isVerified: false,
        otpHash,
        otpExpires,
        consents: {
          termsAccepted: true,
          ageConfirmed13Plus: true,
          marketingOptIn: Boolean(marketingOptIn),
          consentedAt: new Date(),
        },
      });
    }

    await sendVerificationOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      unsubscribeUrl: buildUnsubscribeLink(user._id),
    });

    res.status(201).json({
      requiresVerification: true,
      email: user.email,
      message: `A 6-digit verification code has been sent to ${user.email}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Gmail 6-digit OTP & issue JWT
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res, next) => {
  try {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : null;
    const otp = req.body.otp ? String(req.body.otp).trim() : null;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and 6-digit OTP are required.' });
    }

    const user = await User.findOne({ email }).select('+otpHash +otpExpires');
    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    if (user.isVerified) {
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    }

    if (!user.otpHash || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    if (hashToken(otp) !== user.otpHash) {
      return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend Gmail OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = async (req, res, next) => {
  try {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : null;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This email is already verified. Please log in.' });
    }

    const otp = generateOtpCode();
    user.otpHash = hashToken(otp);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      unsubscribeUrl: buildUnsubscribeLink(user._id),
    });

    res.status(200).json({ message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { password } = req.body;
    const email = req.body.email ? req.body.email.trim().toLowerCase() : null;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      const otp = generateOtpCode();
      user.otpHash = hashToken(otp);
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendVerificationOtpEmail({
        to: user.email,
        name: user.name,
        otp,
        unsubscribeUrl: buildUnsubscribeLink(user._id),
      });

      return res.status(403).json({
        requiresVerification: true,
        email: user.email,
        message: 'Please verify your email address. A fresh 6-digit code has been sent.',
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send Forgot Password link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : null;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address.' });
    }

    const user = await User.findOne({ email });
    // Always return generic success message to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        message: 'If an account exists for that email, a password reset link has been sent.',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashToken(rawToken);
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    const resetUrl = `${config.clientUrl}/reset-password/${rawToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      unsubscribeUrl: buildUnsubscribeLink(user._id),
    });

    res.status(200).json({
      message: 'If an account exists for that email, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Password reset link is invalid or has expired.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    One-click email opt-out / unsubscribe endpoint
// @route   GET /api/auth/unsubscribe/:userId
// @access  Public (HMAC-verified)
export const unsubscribeEmails = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { sig } = req.query;

    const expectedSig = crypto
      .createHmac('sha256', config.jwtSecret)
      .update(String(userId))
      .digest('hex')
      .slice(0, 16);

    if (!sig || sig !== expectedSig) {
      return res.status(400).send('Invalid unsubscribe link.');
    }

    await User.findByIdAndUpdate(userId, {
      $set: {
        unsubscribedFromEmails: true,
        'consents.marketingOptIn': false,
      },
    });

    res.status(200).send(`
      <html>
        <body style="font-family: sans-serif; background: #080B11; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="max-width: 420px; text-align: center; padding: 32px; background: #0E131F; border: 1px solid #27272a; border-radius: 12px;">
            <h2 style="margin-top: 0;">Unsubscribed</h2>
            <p style="color: #a1a1aa; font-size: 14px;">You have been opted out of all non-essential PrepGenius emails.</p>
            <a href="${config.clientUrl}/login" style="display: inline-block; margin-top: 12px; color: #818cf8; font-size: 14px;">Return to PrepGenius</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc    Permanently delete user account & all associated data (GDPR/DPDP Right to Erasure)
// @route   DELETE /api/auth/account
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Submission.deleteMany({ userId }),
      ChatSession.deleteMany({ userId }),
      InterviewSession.deleteMany({ userId }),
      ResumeAudit.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.status(200).json({
      success: true,
      message: 'Your account and all associated practice data have been permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};