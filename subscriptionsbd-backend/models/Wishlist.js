"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Wishlist", {
    id:        { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "user_id" },
    productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "product_id" },
  }, { tableName: "wishlists", timestamps: true, indexes: [{ fields: ["user_id", "product_id"], unique: true }] });
};
