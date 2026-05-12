"use strict";

const express = require("express");
const router  = express.Router();

const { authenticate, optionalAuth, requireAdmin, requireSuperAdmin } = require("../middleware/auth");

const authCtrl    = require("../controllers/authController");
const productCtrl = require("../controllers/productController");
const orderCtrl   = require("../controllers/orderController");
const payCtrl     = require("../controllers/paymentController");
const blogCtrl    = require("../controllers/blogController");
const reviewCtrl  = require("../controllers/reviewController");
const couponCtrl  = require("../controllers/couponController");
const adminCtrl   = require("../controllers/adminController");

// ── AUTH ──────────────────────────────────────────────────────
router.post("/auth/firebase-login",   authCtrl.firebaseLogin);
router.post("/auth/admin-login",      authCtrl.adminLogin);
router.get ("/auth/me",               authenticate, authCtrl.getProfile);
router.put ("/auth/profile",          authenticate, authCtrl.updateProfile);
router.post("/auth/change-password",  authenticate, authCtrl.changePassword);

// ── CATEGORIES ────────────────────────────────────────────────
router.get("/categories", productCtrl.getCategories);

// ── PRODUCTS ──────────────────────────────────────────────────
router.get   ("/products",      productCtrl.getProducts);
router.get   ("/products/:slug", productCtrl.getProduct);
router.post  ("/products",      authenticate, requireAdmin,      productCtrl.createProduct);
router.put   ("/products/:id",  authenticate, requireAdmin,      productCtrl.updateProduct);
router.delete("/products/:id",  authenticate, requireSuperAdmin, productCtrl.deleteProduct);

// ── ORDERS ────────────────────────────────────────────────────
router.post("/orders",                  optionalAuth,  orderCtrl.placeOrder);
router.get ("/orders",                  authenticate,  orderCtrl.getOrders);
router.get ("/orders/:orderNumber",     authenticate,  orderCtrl.getOrder);
router.put ("/orders/:id/status",       authenticate,  requireAdmin, orderCtrl.updateOrderStatus);
router.post("/orders/:id/cancel",       authenticate,  orderCtrl.cancelOrder);

// ── PAYMENTS ──────────────────────────────────────────────────
router.post("/payments/sslcommerz/initiate", optionalAuth, payCtrl.initiateSSL);
router.post("/payments/sslcommerz/success",  payCtrl.sslSuccess);
router.post("/payments/sslcommerz/fail",     payCtrl.sslFail);
router.post("/payments/sslcommerz/cancel",   payCtrl.sslCancel);
router.post("/payments/sslcommerz/ipn",      payCtrl.sslIPN);
router.post("/payments/verify-manual",       authenticate, requireAdmin, payCtrl.verifyManual);

// ── BLOG ──────────────────────────────────────────────────────
router.get   ("/blog/categories",      blogCtrl.getBlogCategories);
router.get   ("/blog/related/:slug",   blogCtrl.getRelatedPosts);
router.get   ("/blog",                 blogCtrl.getPosts);
router.get   ("/blog/:slug",           blogCtrl.getPost);
router.post  ("/blog",                 authenticate, requireAdmin, blogCtrl.createPost);
router.put   ("/blog/:id",             authenticate, requireAdmin, blogCtrl.updatePost);
router.delete("/blog/:id",             authenticate, requireAdmin, blogCtrl.deletePost);

// ── REVIEWS ───────────────────────────────────────────────────
router.get   ("/reviews",                    reviewCtrl.getAllReviews);          // ← add this
router.get   ("/reviews/product/:productId", reviewCtrl.getProductReviews);
router.get   ("/reviews/pending",            authenticate, requireAdmin, reviewCtrl.getPendingReviews);
router.post  ("/reviews",                    optionalAuth, reviewCtrl.submitReview);
router.put   ("/reviews/:id/approve",        authenticate, requireAdmin, reviewCtrl.approveReview);
router.delete("/reviews/:id",               authenticate, requireAdmin, reviewCtrl.deleteReview);

// ── COUPONS ───────────────────────────────────────────────────
router.post  ("/coupons/validate",  couponCtrl.validateCoupon);
router.get   ("/coupons",           authenticate, requireAdmin, couponCtrl.getCoupons);
router.post  ("/coupons",           authenticate, requireAdmin, couponCtrl.createCoupon);
router.put   ("/coupons/:id",       authenticate, requireAdmin, couponCtrl.updateCoupon);
router.delete("/coupons/:id",       authenticate, requireAdmin, couponCtrl.deleteCoupon);

// ── ADMIN ─────────────────────────────────────────────────────
router.get("/admin/stats",                          authenticate, requireAdmin,      adminCtrl.getStats);
router.get("/admin/users",                          authenticate, requireAdmin,      adminCtrl.getUsers);
router.put("/admin/users/:id/toggle-active",        authenticate, requireAdmin,      adminCtrl.toggleUserActive);
router.put("/admin/users/:id/role",                 authenticate, requireSuperAdmin, adminCtrl.updateUserRole);

module.exports = router;
