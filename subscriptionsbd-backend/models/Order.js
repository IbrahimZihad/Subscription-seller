"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Order", {
    id:             { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    orderNumber:    { type: DataTypes.STRING(20), allowNull: false, unique: true, field: "order_number", defaultValue: () => "SBD-" + Date.now().toString().slice(-8) },
    userId:         { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: "user_id" },
    couponId:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: "coupon_id" },
    status:         { type: DataTypes.ENUM("pending","paid","processing","delivered","completed","cancelled","refunded"), defaultValue: "pending" },
    paymentStatus:  { type: DataTypes.ENUM("unpaid","paid","failed","refunded"), defaultValue: "unpaid", field: "payment_status" },
    paymentMethod:  { type: DataTypes.ENUM("bkash","nagad","rocket","sslcommerz","bank"), allowNull: true, field: "payment_method" },
    customerName:   { type: DataTypes.STRING(100), allowNull: false, field: "customer_name" },
    customerPhone:  { type: DataTypes.STRING(20), allowNull: false, field: "customer_phone" },
    customerEmail:  { type: DataTypes.STRING(191), allowNull: true, field: "customer_email" },
    subtotal:       { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    discountAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: "discount_amount" },
    total:          { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    transactionId:  { type: DataTypes.STRING(100), allowNull: true, field: "transaction_id" },
    notes:          { type: DataTypes.TEXT, allowNull: true },
    adminNotes:     { type: DataTypes.TEXT, allowNull: true, field: "admin_notes" },
    deliveryData:   { type: DataTypes.TEXT("long"), allowNull: true, field: "delivery_data" },
    deliveredAt:    { type: DataTypes.DATE, allowNull: true, field: "delivered_at" },
    paidAt:         { type: DataTypes.DATE, allowNull: true, field: "paid_at" },
  }, {
    tableName: "orders", timestamps: true,
    indexes: [{ fields: ["order_number"] }, { fields: ["user_id"] }, { fields: ["status"] }, { fields: ["payment_status"] }],
  });
};
