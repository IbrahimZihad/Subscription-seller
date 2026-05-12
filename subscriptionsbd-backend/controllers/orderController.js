"use strict";

const { Op } = require("sequelize");
const { Order, OrderItem, Payment, Product, ProductPlan, Coupon, User } = require("../models");

/** POST /api/orders — place a new order */
exports.placeOrder = async (req, res) => {
  try {
    const { items, customerName, customerPhone, customerEmail, paymentMethod, transactionId, couponCode, notes } = req.body;

    if (!items || !items.length) return res.status(400).json({ success: false, message: "No items in order" });
    if (!customerName || !customerPhone) return res.status(400).json({ success: false, message: "Name and phone are required" });

    // Validate items & calculate subtotal
    let subtotal = 0;
    const lineItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { include: [{ model: ProductPlan, as: "plans" }] });
      if (!product || !product.isActive || !product.inStock) {
        return res.status(400).json({ success: false, message: `Product not available: ${item.productId}` });
      }

      let unitPrice = parseFloat(product.basePrice);
      let planName  = null;

      if (item.planId) {
        const plan = product.plans.find((p) => p.id === parseInt(item.planId));
        if (!plan || !plan.isActive) return res.status(400).json({ success: false, message: `Plan not found: ${item.planId}` });
        unitPrice = parseFloat(plan.price);
        planName  = plan.name;
      }

      const qty       = parseInt(item.quantity) || 1;
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      lineItems.push({ productId: product.id, planId: item.planId || null, productName: product.name, planName, unitPrice, quantity: qty, subtotal: lineTotal });
    }

    // Coupon
    let discountAmount = 0;
    let coupon         = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        where: {
          code:     couponCode.toUpperCase(),
          isActive: true,
          [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }],
        },
      });
      if (!coupon) return res.status(400).json({ success: false, message: "Invalid or expired coupon" });
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
      if (subtotal < parseFloat(coupon.minOrderAmount)) return res.status(400).json({ success: false, message: `Minimum order ৳${coupon.minOrderAmount} required` });

      discountAmount = coupon.discountType === "percentage"
        ? (subtotal * parseFloat(coupon.discountValue)) / 100
        : parseFloat(coupon.discountValue);

      if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount));
      discountAmount = Math.min(discountAmount, subtotal);
    }

    const total = subtotal - discountAmount;

    // Create order
    const order = await Order.create({
      orderNumber:   "SBD-" + Date.now().toString().slice(-8),
      userId:        req.user?.id || null,
      couponId:      coupon?.id || null,
      status:        "pending",
      paymentStatus: "unpaid",
      paymentMethod: paymentMethod || null,
      customerName, customerPhone, customerEmail: customerEmail || null,
      subtotal, discountAmount, total,
      transactionId: transactionId || null,
      notes:         notes || null,
    });

    // Order items
    for (const item of lineItems) await OrderItem.create({ orderId: order.id, ...item });

    // Increment coupon usage
    if (coupon) await coupon.increment("usedCount");

    // Increment product sales count
    for (const item of lineItems) await Product.increment("salesCount", { by: item.quantity, where: { id: item.productId } });

    // Create payment record for manual methods
    if (paymentMethod && paymentMethod !== "sslcommerz" && transactionId) {
      await Payment.create({ orderId: order.id, method: paymentMethod, amount: total, currency: "BDT", status: "pending", transactionId, senderNumber: customerPhone });
    }

    const fullOrder = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: "items" }] });

    return res.status(201).json({ success: true, message: "Order placed! We'll deliver within 30 minutes.", data: fullOrder });
  } catch (error) {
    console.error("Place order error:", error);
    return res.status(500).json({ success: false, message: "Server error placing order" });
  }
};

/** GET /api/orders */
exports.getOrders = async (req, res) => {
  try {
    const isAdmin = ["admin", "moderator"].includes(req.user?.role);
    const { status, page = 1, limit = 10 } = req.query;

    const where  = {};
    if (!isAdmin) where.userId = req.user.id;
    if (status)   where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: orders, count: total } = await Order.findAndCountAll({
      where, order: [["createdAt", "DESC"]], limit: parseInt(limit), offset,
      include: [
        { model: OrderItem, as: "items" },
        { model: Payment,   as: "payment" },
        ...(isAdmin ? [{ model: User, as: "user", attributes: ["id", "name", "email", "phone"] }] : []),
      ],
    });

    return res.json({
      success: true, data: orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/orders/:orderNumber */
exports.getOrder = async (req, res) => {
  try {
    const isAdmin = ["admin", "moderator"].includes(req.user?.role);
    const where   = { orderNumber: req.params.orderNumber };
    if (!isAdmin) where.userId = req.user.id;

    const order = await Order.findOne({
      where,
      include: [
        { model: OrderItem, as: "items", include: [{ model: Product, as: "product", attributes: ["id", "name", "slug", "image"] }] },
        { model: Payment,   as: "payment" },
        { model: Coupon,    as: "coupon", attributes: ["code", "discountType", "discountValue"] },
      ],
    });

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.json({ success: true, data: order });
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** PUT /api/orders/:id/status [ADMIN] */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryData, adminNotes, paymentStatus } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const updates = {};
    if (status)        { updates.status = status;               if (status === "delivered") updates.deliveredAt = new Date(); }
    if (paymentStatus) { updates.paymentStatus = paymentStatus; if (paymentStatus === "paid") updates.paidAt = new Date(); }
    if (deliveryData)  updates.deliveryData = JSON.stringify(deliveryData);
    if (adminNotes)    updates.adminNotes = adminNotes;

    await order.update(updates);
    return res.json({ success: true, message: "Order updated", data: order });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** POST /api/orders/:id/cancel */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!["pending", "paid"].includes(order.status)) return res.status(400).json({ success: false, message: "Order cannot be cancelled at this stage" });
    await order.update({ status: "cancelled" });
    return res.json({ success: true, message: "Order cancelled" });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
