"use strict";

const { Order, Payment }    = require("../models");
const { initiatePayment, validatePayment } = require("../sslcommerz");

const FRONTEND = process.env.FRONTEND_URL || "http://localhost:3000";

/** POST /api/payments/sslcommerz/initiate */
exports.initiateSSL = async (req, res) => {
  try {
    const { orderNumber } = req.body;
    const order = await Order.findOne({ where: { orderNumber } });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.paymentStatus === "paid") return res.status(400).json({ success: false, message: "Order already paid" });

    const result = await initiatePayment(order, {
      name:  order.customerName,
      email: order.customerEmail || "customer@subscriptionsbd.net",
      phone: order.customerPhone,
    });

    await Payment.upsert({ orderId: order.id, method: "sslcommerz", amount: order.total, currency: "BDT", status: "pending", sslSessionKey: result.sessionKey });
    await order.update({ paymentMethod: "sslcommerz" });

    return res.json({ success: true, redirectURL: result.redirectURL, sessionKey: result.sessionKey });
  } catch (error) {
    console.error("Initiate SSL payment error:", error);
    return res.status(500).json({ success: false, message: "Payment initiation failed: " + error.message });
  }
};

/** POST /api/payments/sslcommerz/success */
exports.sslSuccess = async (req, res) => {
  try {
    const { val_id, tran_id, bank_tran_id, card_type } = req.body;
    if (!val_id) return res.redirect(`${FRONTEND}/cart?payment=failed&reason=no_val_id`);

    const validation = await validatePayment(val_id);
    if (validation.status !== "VALID" && validation.status !== "VALIDATED") {
      return res.redirect(`${FRONTEND}/cart?payment=failed&reason=validation_failed`);
    }

    const order = await Order.findOne({ where: { orderNumber: tran_id } });
    if (!order) return res.redirect(`${FRONTEND}/cart?payment=failed&reason=order_not_found`);

    await order.update({ status: "paid", paymentStatus: "paid", paidAt: new Date() });
    await Payment.update(
      { status: "success", sslValId: val_id, sslBankTxnId: bank_tran_id, sslCardType: card_type, paidAt: new Date(), gatewayResponse: validation },
      { where: { orderId: order.id } }
    );

    return res.redirect(`${FRONTEND}/cart?payment=success&order=${order.orderNumber}`);
  } catch (error) {
    console.error("SSL success error:", error);
    return res.redirect(`${FRONTEND}/cart?payment=failed&reason=server_error`);
  }
};

/** POST /api/payments/sslcommerz/fail */
exports.sslFail = async (req, res) => {
  const { tran_id } = req.body;
  if (tran_id) {
    const order = await Order.findOne({ where: { orderNumber: tran_id } }).catch(() => null);
    if (order) await Payment.update({ status: "failed" }, { where: { orderId: order.id } }).catch(() => null);
  }
  return res.redirect(`${FRONTEND}/cart?payment=failed`);
};

/** POST /api/payments/sslcommerz/cancel */
exports.sslCancel = async (req, res) => {
  const { tran_id } = req.body;
  if (tran_id) {
    const order = await Order.findOne({ where: { orderNumber: tran_id } }).catch(() => null);
    if (order) await Payment.update({ status: "cancelled" }, { where: { orderId: order.id } }).catch(() => null);
  }
  return res.redirect(`${FRONTEND}/cart?payment=cancelled`);
};

/** POST /api/payments/sslcommerz/ipn — background webhook */
exports.sslIPN = async (req, res) => {
  try {
    const { val_id, tran_id, status } = req.body;
    if (status === "VALID" && val_id) {
      const validation = await validatePayment(val_id);
      if (validation.status === "VALID" || validation.status === "VALIDATED") {
        const order = await Order.findOne({ where: { orderNumber: tran_id } });
        if (order && order.paymentStatus !== "paid") {
          await order.update({ status: "paid", paymentStatus: "paid", paidAt: new Date() });
          await Payment.update({ status: "success", sslValId: val_id, paidAt: new Date(), gatewayResponse: validation }, { where: { orderId: order.id } });
        }
      }
    }
    return res.status(200).send("OK");
  } catch (error) {
    console.error("SSL IPN error:", error);
    return res.status(200).send("OK");
  }
};

/** POST /api/payments/verify-manual [ADMIN] — confirm bKash/Nagad payment */
exports.verifyManual = async (req, res) => {
  try {
    const { orderId, transactionId, confirmed } = req.body;
    const order = await Order.findByPk(orderId, { include: [{ model: Payment, as: "payment" }] });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (confirmed) {
      await order.update({ paymentStatus: "paid", status: "processing", paidAt: new Date(), transactionId });
      if (order.payment) {
        await order.payment.update({ status: "success", transactionId, paidAt: new Date() });
      } else {
        await Payment.create({ orderId: order.id, method: order.paymentMethod || "bkash", amount: order.total, currency: "BDT", status: "success", transactionId, paidAt: new Date() });
      }
      return res.json({ success: true, message: "Payment confirmed — order is now processing" });
    } else {
      await order.update({ paymentStatus: "failed", status: "cancelled" });
      return res.json({ success: true, message: "Payment rejected" });
    }
  } catch (error) {
    console.error("Verify manual payment error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
