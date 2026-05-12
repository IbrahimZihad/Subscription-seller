"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("ProductPlan", {
    id:            { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    productId:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "product_id" },
    name:          { type: DataTypes.STRING(100), allowNull: false },
    duration:      { type: DataTypes.STRING(50), allowNull: false },
    durationDays:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "duration_days" },
    price:         { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    originalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: "original_price" },
    features:      { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    isPopular:     { type: DataTypes.BOOLEAN, defaultValue: false, field: "is_popular" },
    isActive:      { type: DataTypes.BOOLEAN, defaultValue: true, field: "is_active" },
    sortOrder:     { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0, field: "sort_order" },
  }, { tableName: "product_plans", timestamps: true, indexes: [{ fields: ["product_id"] }] });
};
