"use strict";

const axios = require("axios");

const BASE_URL   = process.env.SSLCZ_IS_LIVE === "true"
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

const STORE_ID   = process.env.SSLCZ_STORE_ID;
const STORE_PASS = process.env.SSLCZ_STORE_PASS;
const BACKEND    = process.env.BACKEND_URL  || "http://localhost:5000";
const FRONTEND   = process.env.FRONTEND_URL || "http://localhost:3000";

/** Initiate a payment session */
const initiatePayment = async (order, customer) => {
  const payload = {
    store_id:      STORE_ID,
    store_passwd:  STORE_PASS,
    total_amount:  order.total,
    currency:      "BDT",
    tran_id:       order.orderNumber,
    success_url:   `${BACKEND}/api/payments/sslcommerz/success`,
    fail_url:      `${BACKEND}/api/payments/sslcommerz/fail`,
    cancel_url:    `${BACKEND}/api/payments/sslcommerz/cancel`,
    ipn_url:       `${BACKEND}/api/payments/sslcommerz/ipn`,
    cus_name:      customer.name,
    cus_email:     customer.email,
    cus_add1:      "Dhaka",
    cus_city:      "Dhaka",
    cus_country:   "Bangladesh",
    cus_phone:     customer.phone,
    shipping_method: "NO",
    product_name:    "Digital Subscription",
    product_category:"Subscription",
    product_profile: "non-physical-goods",
    value_a:         order.id.toString(),
    value_b:         order.orderNumber,
  };

  const response = await axios.post(
    `${BASE_URL}/gwprocess/v4/api.php`,
    new URLSearchParams(payload).toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const data = response.data;
  if (data.status !== "SUCCESS") throw new Error(data.failedreason || "SSLCommerz session failed");

  return { success: true, redirectURL: data.GatewayPageURL, sessionKey: data.sessionkey, data };
};

/** Validate a payment with SSLCommerz */
const validatePayment = async (valId) => {
  const response = await axios.get(`${BASE_URL}/validator/api/validationserverAPI.php`, {
    params: { val_id: valId, store_id: STORE_ID, store_passwd: STORE_PASS, format: "json" },
  });
  const data = response.data;
  if (data.status !== "VALID" && data.status !== "VALIDATED") throw new Error(`Validation failed: ${data.status}`);
  return data;
};

/** Refund a payment */
const refundPayment = async (bankTxnId, amount, reason = "Customer request") => {
  const response = await axios.get(`${BASE_URL}/validator/api/merchantTransIDvalidationAPI.php`, {
    params: { bank_tran_id: bankTxnId, store_id: STORE_ID, store_passwd: STORE_PASS, refund_amount: amount, refund_remarks: reason, format: "json" },
  });
  return response.data;
};

module.exports = { initiatePayment, validatePayment, refundPayment };
