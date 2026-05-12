"use strict";

const jwt = require("jsonwebtoken");
const { verifyFirebaseToken } = require("../firebase/admin");
const { User } = require("../models");

/**
 * PRIMARY:  Verify Firebase ID token  →  Authorization: Bearer <firebase_id_token>
 * FALLBACK: Verify our own JWT       →  Authorization: Bearer <our_jwt>
 * Auto-creates MySQL user row on first Firebase login.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No authorization token provided" });
    }

    const token = authHeader.split(" ")[1];

    // ── Try Firebase token ────────────────────────────────────
    try {
      const decoded = await verifyFirebaseToken(token);

      let user = await User.findOne({ where: { firebaseUid: decoded.uid } });

      if (!user) {
        // Check if email already exists (e.g. registered before Firebase)
        user = await User.findOne({ where: { email: decoded.email } });
        if (user) {
          // Link existing account to Firebase UID
          await user.update({
            firebaseUid:     decoded.uid,
            provider:        decoded.firebase?.sign_in_provider === "google.com" ? "google" : "email",
            isEmailVerified: decoded.email_verified || false,
            avatar:          user.avatar || decoded.picture || null,
            lastLoginAt:     new Date(),
          });
        } else {
          // Brand-new user — auto-create in MySQL
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

      req.user     = user;
      req.authType = "firebase";
      return next();
    } catch (_firebaseErr) {
      // Firebase verification failed — try our own JWT
    }

    // ── Fallback: our own JWT (admin email/password login) ────
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findByPk(decoded.id);

      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: "Invalid or inactive account" });
      }

      req.user     = user;
      req.authType = "jwt";
      return next();
    } catch (_jwtErr) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};

/** Optional auth — attaches user if token present, proceeds if not */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }
  return authenticate(req, res, next);
};

/** Require admin or moderator */
const requireAdmin = (req, res, next) => {
  if (!req.user || !["admin", "moderator"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

/** Require super admin only */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Super admin access required" });
  }
  next();
};

module.exports = { authenticate, optionalAuth, requireAdmin, requireSuperAdmin };
