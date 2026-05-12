"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Payment", {
    id:              { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    orderId:         { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true, field: "order_id" },
    method:          { type: DataTypes.ENUM("bkash","nagad","rocket","sslcommerz","bank"), allowNull: false },
    amount:          { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency:        { type: DataTypes.STRING(5), defaultValue: "BDT" },
    status:          { type: DataTypes.ENUM("pending","success","failed","cancelled","refunded"), defaultValue: "pending" },
    transactionId:   { type: DataTypes.STRING(100), allowNull: true, field: "transaction_id" },
    senderNumber:    { type: DataTypes.STRING(20), allowNull: true, field: "sender_number" },
    sslSessionKey:   { type: DataTypes.STRING(255), allowNull: true, field: "ssl_session_key" },
    sslValId:        { type: DataTypes.STRING(255), allowNull: true, field: "ssl_val_id" },
    sslBankTxnId:    { type: DataTypes.STRING(255), allowNull: true, field: "ssl_bank_txn_id" },
    sslCardType:     { type: DataTypes.STRING(50), allowNull: true, field: "ssl_card_type" },
    gatewayResponse: { type: DataTypes.JSON, allowNull: true, field: "gateway_response" },
    paidAt:          { type: DataTypes.DATE, allowNull: true, field: "paid_at" },
    refundedAt:      { type: DataTypes.DATE, allowNull: true, field: "refunded_at" },
    refundAmount:    { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: "refund_amount" },
    notes:           { type: DataTypes.TEXT, allowNull: true },
  }, { tableName: "payments", timestamps: true, indexes: [{ fields: ["order_id"] }, { fields: ["transaction_id"] }, { fields: ["status"] }] });
};
