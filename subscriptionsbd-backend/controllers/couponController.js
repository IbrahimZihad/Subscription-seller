"use strict";

const { Coupon } = require("../models");
const { Op }     = require("sequelize");

/** POST /api/coupons/validate — public */
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "Coupon code required" });

    const coupon = await Coupon.findOne({
      where: {
        code:     code.toUpperCase(),
        isActive: true,
        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }],
        [Op.or]: [{ startsAt: null },  { startsAt:  { [Op.lte]: new Date() } }],
      },
    });

    if (!coupon)                                                          return res.status(400).json({ success: false, message: "Invalid or expired coupon code" });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)       return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    if (orderTotal && parseFloat(orderTotal) < parseFloat(coupon.minOrderAmount)) return res.status(400).json({ success: false, message: `Minimum order ৳${coupon.minOrderAmount} required` });

    let discount = coupon.discountType === "percentage"
      ? (parseFloat(orderTotal || 0) * parseFloat(coupon.discountValue)) / 100
      : parseFloat(coupon.discountValue);

    if (coupon.maxDiscount) discount = Math.min(discount, parseFloat(coupon.maxDiscount));

    return res.json({
      success: true,
      coupon:  { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, description: coupon.description },
      discountAmount: Math.round(discount * 100) / 100,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/coupons [ADMIN] */
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [["createdAt", "DESC"]] });
    return res.json({ success: true, data: coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** POST /api/coupons [ADMIN] */
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, code: req.body.code.toUpperCase() });
    return res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") return res.status(400).json({ success: false, message: "Coupon code already exists" });
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** PUT /api/coupons/:id [ADMIN] */
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    await coupon.update(req.body);
    return res.json({ success: true, data: coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** DELETE /api/coupons/:id [ADMIN] */
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    await coupon.destroy();
    return res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
