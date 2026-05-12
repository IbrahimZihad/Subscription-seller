"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Review", {
    id:                  { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    productId:           { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "product_id" },
    userId:              { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: "user_id" },
    orderId:             { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: "order_id" },
    reviewerName:        { type: DataTypes.STRING(100), allowNull: false, field: "reviewer_name" },
    reviewerRole:        { type: DataTypes.STRING(100), allowNull: true, field: "reviewer_role" },
    rating:              { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, validate: { min: 1, max: 5 } },
    title:               { type: DataTypes.STRING(200), allowNull: true },
    body:                { type: DataTypes.TEXT, allowNull: false },
    isVerifiedPurchase:  { type: DataTypes.BOOLEAN, defaultValue: false, field: "is_verified_purchase" },
    isApproved:          { type: DataTypes.BOOLEAN, defaultValue: false, field: "is_approved" },
    helpfulCount:        { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0, field: "helpful_count" },
  }, { tableName: "reviews", timestamps: true, indexes: [{ fields: ["product_id"] }, { fields: ["is_approved"] }] });
};
