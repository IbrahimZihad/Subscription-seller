"use strict";

const { Review, Product, Order, OrderItem } = require("../models");
const { Op } = require("sequelize");

exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating, sortBy = "createdAt", order = "DESC", verified = null } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = { isApproved: true };

    if (rating) {
      whereClause.rating = parseInt(rating);
    }

    if (verified !== null) {
      whereClause.isVerifiedPurchase = verified === "true";
    }

    const { rows: reviews, count: total } = await Review.findAndCountAll({
      where: whereClause,
      order: [[sortBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      include: [{ model: Product, as: "product", attributes: ["id", "name", "slug"] }],
      attributes: { exclude: ["userId", "orderId"] },
    });

    return res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all reviews error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** POST /api/reviews — submit a review */
exports.submitReview = async (req, res) => {
  try {
    const { productId, rating, title, body, reviewerName, reviewerRole } = req.body;

    if (!productId || !rating || !body) {
      return res.status(400).json({ success: false, message: "productId, rating and body are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // Check for verified purchase
    let isVerifiedPurchase = false;
    let orderId            = null;

    if (req.user) {
      const purchasedOrder = await Order.findOne({
        where:   { userId: req.user.id, status: { [Op.in]: ["delivered", "completed"] } },
        include: [{ model: OrderItem, as: "items", where: { productId }, required: true }],
      });
      if (purchasedOrder) {
        isVerifiedPurchase = true;
        orderId            = purchasedOrder.id;
      }
    }

    const review = await Review.create({
      productId,
      userId:              req.user?.id || null,
      orderId,
      reviewerName:        reviewerName || req.user?.name || "Anonymous",
      reviewerRole:        reviewerRole || null,
      rating:              parseInt(rating),
      title:               title || null,
      body,
      isVerifiedPurchase,
      isApproved:          false,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted! It will appear after admin approval.",
      data: review,
    });
  } catch (error) {
    console.error("Submit review error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/reviews/product/:productId */
exports.getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: reviews, count: total } = await Review.findAndCountAll({
      where:  { productId: req.params.productId, isApproved: true },
      order:  [["createdAt", "DESC"]],
      limit:  parseInt(limit),
      offset,
    });

    return res.json({
      success: true, data: reviews,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/reviews/pending [ADMIN] */
exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { isApproved: false },
      order: [["createdAt", "DESC"]],
      include: [{ model: Product, as: "product", attributes: ["id", "name", "slug"] }],
    });
    return res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Get pending reviews error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** PUT /api/reviews/:id/approve [ADMIN] */
exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    await review.update({ isApproved: true });

    // Recalculate product avg rating
    const allReviews = await Review.findAll({ where: { productId: review.productId, isApproved: true }, attributes: ["rating"] });
    const avg        = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.update(
      { avgRating: Math.round(avg * 100) / 100, reviewCount: allReviews.length },
      { where: { id: review.productId } }
    );

    return res.json({ success: true, message: "Review approved and product rating updated" });
  } catch (error) {
    console.error("Approve review error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** DELETE /api/reviews/:id [ADMIN] */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    await review.destroy();
    return res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
