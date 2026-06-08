"use strict";

const express = require("express");
const router  = express.Router();
const { body, param } = require("express-validator");

const { authenticate, optionalAuth, requireAdmin, requireSuperAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");

const authCtrl    = require("../controllers/authController");
const productCtrl = require("../controllers/productController");
const orderCtrl   = require("../controllers/orderController");
const payCtrl     = require("../controllers/paymentController");
const blogCtrl    = require("../controllers/blogController");
const reviewCtrl  = require("../controllers/reviewController");
const couponCtrl  = require("../controllers/couponController");
const adminCtrl   = require("../controllers/adminController");

// ── AUTH ──────────────────────────────────────────────────────
router.post("/auth/firebase-login",
  [
    body("idToken").notEmpty().withMessage("ID token is required").trim(),
  ], validate,
  authCtrl.firebaseLogin
);

router.post("/auth/admin-login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters").trim(),
  ], validate,
  authCtrl.adminLogin
);

router.get("/auth/me", authenticate, authCtrl.getProfile);

router.put("/auth/profile",
  authenticate,
  [
    body("name").optional().trim().escape().isLength({ max: 100 }),
    body("phone").optional().trim().escape().isLength({ max: 20 }),
  ], validate,
  authCtrl.updateProfile
);

router.post("/auth/change-password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required").trim(),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters").trim(),
  ], validate,
  authCtrl.changePassword
);

// ── CATEGORIES ────────────────────────────────────────────────
router.get("/categories", productCtrl.getCategories);

// ── PRODUCTS ──────────────────────────────────────────────────
router.get("/products",       productCtrl.getProducts);
router.get("/products/:slug", productCtrl.getProduct);

router.post("/products",
  authenticate, requireAdmin,
  [
    body("name").notEmpty().withMessage("Name is required").trim().escape(),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("description").optional().trim().escape(),
    body("categoryId").optional().isInt().withMessage("Category ID must be an integer"),
  ], validate,
  productCtrl.createProduct
);

router.put("/products/:id",
  authenticate, requireAdmin,
  [
    param("id").isInt().withMessage("Invalid product ID"),
    body("name").optional().trim().escape(),
    body("price").optional().isNumeric().withMessage("Price must be a number"),
    body("description").optional().trim().escape(),
  ], validate,
  productCtrl.updateProduct
);

router.delete("/products/:id",
  authenticate, requireSuperAdmin,
  [param("id").isInt().withMessage("Invalid product ID")], validate,
  productCtrl.deleteProduct
);

// ── ORDERS ────────────────────────────────────────────────────
router.post("/orders",
  optionalAuth,
  [
    body("items").isArray({ min: 1 }).withMessage("Order must have at least one item"),
    body("items.*.productId").isInt().withMessage("Invalid product ID"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("customerName").notEmpty().withMessage("Customer name is required").trim().escape(),
    body("customerEmail").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("customerPhone").notEmpty().withMessage("Phone is required").trim().escape(),
  ], validate,
  orderCtrl.placeOrder
);

router.get("/orders",                authenticate, orderCtrl.getOrders);
router.get("/orders/:orderNumber",   authenticate, orderCtrl.getOrder);

router.put("/orders/:id/status",
  authenticate, requireAdmin,
  [
    param("id").isInt().withMessage("Invalid order ID"),
    body("status").notEmpty().withMessage("Status is required").trim().escape(),
  ], validate,
  orderCtrl.updateOrderStatus
);

router.post("/orders/:id/cancel",
  authenticate,
  [param("id").isInt().withMessage("Invalid order ID")], validate,
  orderCtrl.cancelOrder
);

// ── PAYMENTS ──────────────────────────────────────────────────
router.post("/payments/sslcommerz/initiate", optionalAuth, payCtrl.initiateSSL);
router.post("/payments/sslcommerz/success",  payCtrl.sslSuccess);
router.post("/payments/sslcommerz/fail",     payCtrl.sslFail);
router.post("/payments/sslcommerz/cancel",   payCtrl.sslCancel);
router.post("/payments/sslcommerz/ipn",      payCtrl.sslIPN);
router.post("/payments/verify-manual",       authenticate, requireAdmin, payCtrl.verifyManual);

// ── BLOG ──────────────────────────────────────────────────────
router.get("/blog/categories",      blogCtrl.getBlogCategories);
router.get("/blog/related/:slug",   blogCtrl.getRelatedPosts);
router.get("/blog",                 blogCtrl.getPosts);
router.get("/blog/:slug",           blogCtrl.getPost);

router.post("/blog",
  authenticate, requireAdmin,
  [
    body("title").notEmpty().withMessage("Title is required").trim().escape(),
    body("content").notEmpty().withMessage("Content is required").trim(),
    body("categoryId").optional().isInt().withMessage("Invalid category ID"),
  ], validate,
  blogCtrl.createPost
);

router.put("/blog/:id",
  authenticate, requireAdmin,
  [
    param("id").isInt().withMessage("Invalid blog ID"),
    body("title").optional().trim().escape(),
    body("content").optional().trim(),
  ], validate,
  blogCtrl.updatePost
);

router.delete("/blog/:id",
  authenticate, requireAdmin,
  [param("id").isInt().withMessage("Invalid blog ID")], validate,
  blogCtrl.deletePost
);

// ── REVIEWS ───────────────────────────────────────────────────
router.get("/reviews",                    reviewCtrl.getAllReviews);
router.get("/reviews/product/:productId", reviewCtrl.getProductReviews);
router.get("/reviews/pending",            authenticate, requireAdmin, reviewCtrl.getPendingReviews);

router.post("/reviews",
  optionalAuth,
  [
    body("productId").isInt().withMessage("Invalid product ID"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().trim().escape().isLength({ max: 1000 }),
    body("reviewerName").optional().trim().escape(),
  ], validate,
  reviewCtrl.submitReview
);

router.put("/reviews/:id/approve",
  authenticate, requireAdmin,
  [param("id").isInt().withMessage("Invalid review ID")], validate,
  reviewCtrl.approveReview
);

router.delete("/reviews/:id",
  authenticate, requireAdmin,
  [param("id").isInt().withMessage("Invalid review ID")], validate,
  reviewCtrl.deleteReview
);

// ── COUPONS ───────────────────────────────────────────────────
router.post("/coupons/validate",
  [
    body("code").notEmpty().withMessage("Coupon code is required").trim().escape().toUpperCase(),
    body("orderAmount").isNumeric().withMessage("Order amount must be a number"),
  ], validate,
  couponCtrl.validateCoupon
);

router.get("/coupons", authenticate, requireAdmin, couponCtrl.getCoupons);

router.post("/coupons",
  authenticate, requireAdmin,
  [
    body("code").notEmpty().withMessage("Coupon code is required").trim().escape().toUpperCase(),
    body("discount").isNumeric().withMessage("Discount must be a number"),
    body("expiresAt").optional().isISO8601().withMessage("Invalid date format"),
  ], validate,
  couponCtrl.createCoupon
);

router.put("/coupons/:id",
  authenticate, requireAdmin,
  [
    param("id").isInt().withMessage("Invalid coupon ID"),
    body("discount").optional().isNumeric().withMessage("Discount must be a number"),
    body("expiresAt").optional().isISO8601().withMessage("Invalid date format"),
  ], validate,
  couponCtrl.updateCoupon
);

router.delete("/coupons/:id",
  authenticate, requireAdmin,
  [param("id").isInt().withMessage("Invalid coupon ID")], validate,
  couponCtrl.deleteCoupon
);

// ── ADMIN ─────────────────────────────────────────────────────
router.get("/admin/stats", authenticate, requireAdmin,      adminCtrl.getStats);
router.get("/admin/users", authenticate, requireAdmin,      adminCtrl.getUsers);

router.put("/admin/users/:id/toggle-active",
  authenticate, requireAdmin,
  [param("id").isInt().withMessage("Invalid user ID")], validate,
  adminCtrl.toggleUserActive
);

router.put("/admin/users/:id/role",
  authenticate, requireSuperAdmin,
  [
    param("id").isInt().withMessage("Invalid user ID"),
    body("role").notEmpty().trim().isIn(["user", "admin", "superadmin"]).withMessage("Invalid role"),
  ], validate,
  adminCtrl.updateUserRole
);

module.exports = router;