"use strict";

const { Op }                                    = require("sequelize");
const { User, Order, Product, Review, Payment, OrderItem } = require("../models");

/** GET /api/admin/stats */
exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, totalRevenue, totalUsers, totalProducts, pendingReviews, pendingOrders] = await Promise.all([
      Order.count(),
      Order.count({ where: { createdAt: { [Op.gte]: today } } }),
      Order.sum("total", { where: { paymentStatus: "paid" } }),
      User.count({ where: { role: "customer" } }),
      Product.count({ where: { isActive: true } }),
      Review.count({ where: { isApproved: false } }),
      Order.count({ where: { status: "pending" } }),
    ]);

    const recentOrders = await Order.findAll({
      order:   [["createdAt", "DESC"]],
      limit:   8,
      include: [
        { model: OrderItem, as: "items" },
        { model: User,      as: "user", attributes: ["id", "name", "email"], required: false },
      ],
    });

    const topProducts = await Product.findAll({
      order:      [["salesCount", "DESC"]],
      limit:      5,
      attributes: ["id", "name", "slug", "salesCount", "avgRating", "basePrice", "image"],
    });

    return res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        totalRevenue:  totalRevenue || 0,
        totalUsers,
        totalProducts,
        pendingReviews,
        pendingOrders,
        recentOrders,
        topProducts,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/admin/users */
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { name:  { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      order:  [["createdAt", "DESC"]],
      limit:  parseInt(limit),
      offset,
    });

    return res.json({
      success: true, data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** PUT /api/admin/users/:id/toggle-active */
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ success: false, message: "Cannot suspend admin account" });
    await user.update({ isActive: !user.isActive });
    return res.json({ success: true, message: `User ${user.isActive ? "activated" : "suspended"}`, user });
  } catch (error) {
    console.error("Toggle user active error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** PUT /api/admin/users/:id/role */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["customer", "moderator", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    await user.update({ role });
    return res.json({ success: true, message: "Role updated", user });
  } catch (error) {
    console.error("Update user role error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
