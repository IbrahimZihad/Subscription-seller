"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Coupon", {
    id:               { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    code:             { type: DataTypes.STRING(50), allowNull: false, unique: true },
    description:      { type: DataTypes.STRING(255), allowNull: true },
    discountType:     { type: DataTypes.ENUM("percentage", "fixed"), allowNull: false, defaultValue: "percentage", field: "discount_type" },
    discountValue:    { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "discount_value" },
    minOrderAmount:   { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: "min_order_amount" },
    maxDiscount:      { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: "max_discount" },
    usageLimit:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: "usage_limit" },
    usedCount:        { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0, field: "used_count" },
    perUserLimit:     { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1, field: "per_user_limit" },
    startsAt:         { type: DataTypes.DATE, allowNull: true, field: "starts_at" },
    expiresAt:        { type: DataTypes.DATE, allowNull: true, field: "expires_at" },
    isActive:         { type: DataTypes.BOOLEAN, defaultValue: true, field: "is_active" },
  }, { tableName: "coupons", timestamps: true, indexes: [{ fields: ["code"] }, { fields: ["is_active"] }] });
};
