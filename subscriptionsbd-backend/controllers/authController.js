"use strict";

const bcrypt             = require("bcryptjs");
const jwt                = require("jsonwebtoken");
const { User }           = require("../models");
const { verifyFirebaseToken } = require("../firebase/admin");

const signJwt = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

/**
 * POST /api/auth/firebase-login
 * Called from Next.js after Firebase Auth sign-in (Google or email/password).
 * Syncs the Firebase user into our MySQL users table and returns our own JWT.
 */
exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: "Firebase ID token is required" });
    }

    const decoded = await verifyFirebaseToken(idToken);

    let user = await User.findOne({ where: { firebaseUid: decoded.uid } });

    if (!user) {
      // Check if email exists already (linked account)
      user = await User.findOne({ where: { email: decoded.email } });

      if (user) {
        await user.update({
          firebaseUid:     decoded.uid,
          provider:        decoded.firebase?.sign_in_provider === "google.com" ? "google" : "email",
          isEmailVerified: decoded.email_verified || false,
          avatar:          user.avatar || decoded.picture || null,
          lastLoginAt:     new Date(),
        });
      } else {
        user = await User.create({
          firebaseUid:     decoded.uid,
          name:            decoded.name || decoded.email?.split("@")[0] || "Customer",
          email:           decoded.email,
          avatar:          decoded.picture || null,
          provider:        decoded.firebase?.sign_in_provider === "google.com" ? "google" : "email",
          isEmailVerified: decoded.email_verified || false,
          role:            "customer",
          isActive:        true,
          lastLoginAt:     new Date(),
        });
      }
    } else {
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: "Account suspended. Contact support." });
      }
      await user.update({ lastLoginAt: new Date() });
    }

    return res.json({
      success: true,
      message: "Login successful",
      user,
      token: signJwt(user),
    });
  } catch (error) {
    console.error("Firebase login error:", error.message);
    return res.status(401).json({ success: false, message: "Firebase token verification failed" });
  }
};

/**
 * POST /api/auth/admin-login
 * Email + password login — admin panel only (not Firebase).
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.scope("withPassword").findOne({ where: { email } }).catch(() =>
      User.findOne({ where: { email } })
    );

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    if (!["admin", "moderator"].includes(user.role)) {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account suspended" });
    }
    if (!user.password) {
      return res.status(400).json({ success: false, message: "This account uses Google login" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    await user.update({ lastLoginAt: new Date() });

    return res.json({
      success: true,
      message: "Admin login successful",
      user,
      token: signJwt(user),
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/auth/me
 */
exports.getProfile = async (req, res) => {
  return res.json({ success: true, user: req.user });
};

/**
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, paymentPhone, avatar } = req.body;
    const updates = {};
    if (name)         updates.name = name;
    if (phone)        updates.phone = phone;
    if (paymentPhone) updates.paymentPhone = paymentPhone;
    if (avatar)       updates.avatar = avatar;

    await req.user.update(updates);
    return res.json({ success: true, message: "Profile updated", user: req.user });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/auth/change-password
 * Only for email/password users (non-Firebase social login).
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both passwords are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
    }

    // Re-fetch with password field
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: { include: ["password"] },
    });

    if (!user.password) {
      return res.status(400).json({ success: false, message: "Password change not available for social login users" });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    await user.update({ password: await bcrypt.hash(newPassword, 12) });
    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
