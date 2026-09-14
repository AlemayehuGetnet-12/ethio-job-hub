import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { createAccessToken, createRefreshToken } from "../utils/generateToken.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    // role cannot be set to admin via public registration. Only allow jobseeker/employer.
    let { role } = req.body || {};
    const allowedRoles = ["jobseeker", "employer"];

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // normalize role, default to jobseeker for safety
    if (!allowedRoles.includes(role)) {
      role = "jobseeker";
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await sendEmail({
      to: user.email,
      subject: "Welcome to EthioJobs Connect",
      html: `<p>Hello ${user.name},</p><p>Your account has been created successfully.</p>`,
    });

    const accessToken = createAccessToken({ id: user._id, role: user.role });
    const refreshToken = createRefreshToken({ id: user._id, role: user.role });

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = createAccessToken({ id: user._id, role: user.role });
    const refreshToken = createRefreshToken({ id: user._id, role: user.role });

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = createAccessToken({ id: user._id, role: user.role });
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${process.env.FRONTEND_URL?.replace(/\/$/, "") || "http://localhost:3000"}/reset-password?token=${encodeURIComponent(resetToken)}`;

      await sendEmail({
        to: user.email,
        subject: "EthioJobs password reset request",
        html: `<p>Hello ${user.name || "there"},</p>
<p>You requested a password reset. Click the link below to set a new password:</p>
<p><a href="${resetUrl}" target="_blank" rel="noopener">Reset your password</a></p>
<p>If you did not request this, you can ignore this email.</p>`,
      });
    }

    res.json({ message: "If an account exists for that email, a password reset link has been sent." });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const token = req.query.token || req.body.token;
    const { password } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired password reset token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = null;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your EthioJobs password has been reset",
      html: `<p>Hello ${user.name || "there"},</p>
<p>Your password has been updated successfully. If you did not perform this action, please contact support immediately.</p>`,
    });

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    next(error);
  }
};


export const telegramAuth = async (req, res, next) => {
  try {
    const data = req.body || {};
    const hash = data.hash;
    if (!hash) return res.status(400).json({ message: 'Invalid telegram auth payload' });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return res.status(500).json({ message: 'Telegram bot token not configured on server' });

    // Build data_check_string from Telegram fields except hash, in ASCII-sorted order
    const cryptoLib = crypto;
    const dataCheckArr = [];
    Object.keys(data).filter(k => k !== 'hash').sort().forEach((k) => {
      dataCheckArr.push(`${k}=${data[k]}`);
    });
    const data_check_string = dataCheckArr.join('\n');

    // secret is SHA256 of bot token
    const secret = cryptoLib.createHash('sha256').update(botToken).digest();
    const hmac = cryptoLib.createHmac('sha256', secret).update(data_check_string).digest('hex');

    if (hmac !== hash) {
      return res.status(401).json({ message: 'Telegram auth validation failed' });
    }

    // telegram auth validated. Create or find user.
    const telegramId = data.id;
    const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username || `tg_${telegramId}`;

    // derive an email-like unique id for persisted user (non-sensitive). Mark as unverified since no email.
    const fakeEmail = `telegram_${telegramId}@ethiojobs.local`;

    let user = await User.findOne({ email: fakeEmail });
    if (!user) {
      user = await User.create({ name, email: fakeEmail, password: cryptoLib.randomBytes(16).toString('hex'), role: 'jobseeker' });
    }

    const accessToken = createAccessToken({ id: user._id, role: user.role });
    const refreshToken = createRefreshToken({ id: user._id, role: user.role });

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ message: 'Telegram login successful', user: { id: user._id, name: user.name, role: user.role }, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export default { register, login, refreshToken, logout, getMe, forgotPassword, resetPassword, telegramAuth };
