"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("OrderItem", {
    id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    orderId:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "order_id" },
    productId:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "product_id" },
    planId:      { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: "plan_id" },
    productName: { type: DataTypes.STRING(200), allowNull: false, field: "product_name" },
    planName:    { type: DataTypes.STRING(100), allowNull: true, field: "plan_name" },
    unitPrice:   { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "unit_price" },
    quantity:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
    subtotal:    { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  }, { tableName: "order_items", timestamps: true, indexes: [{ fields: ["order_id"] }, { fields: ["product_id"] }] });
};
