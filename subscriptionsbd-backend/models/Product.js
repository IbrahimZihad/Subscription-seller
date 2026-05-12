"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Product", {
    id:               { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    categoryId:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "category_id" },
    name:             { type: DataTypes.STRING(200), allowNull: false },
    slug:             { type: DataTypes.STRING(220), allowNull: false, unique: true },
    shortDescription: { type: DataTypes.STRING(500), allowNull: true, field: "short_description" },
    description:      { type: DataTypes.TEXT("long"), allowNull: true },
    image:            { type: DataTypes.STRING(500), allowNull: true },
    badge:            { type: DataTypes.STRING(50), allowNull: true },
    basePrice:        { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: "base_price" },
    originalPrice:    { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: "original_price" },
    deliveryTime:     { type: DataTypes.STRING(50), allowNull: true, defaultValue: "Instant", field: "delivery_time" },
    features:         { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    avgRating:        { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0, field: "avg_rating" },
    reviewCount:      { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0, field: "review_count" },
    salesCount:       { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0, field: "sales_count" },
    isFeatured:       { type: DataTypes.BOOLEAN, defaultValue: false, field: "is_featured" },
    inStock:          { type: DataTypes.BOOLEAN, defaultValue: true, field: "in_stock" },
    isActive:         { type: DataTypes.BOOLEAN, defaultValue: true, field: "is_active" },
    metaTitle:        { type: DataTypes.STRING(200), allowNull: true, field: "meta_title" },
    metaDescription:  { type: DataTypes.STRING(500), allowNull: true, field: "meta_description" },
    sortOrder:        { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0, field: "sort_order" },
  }, {
    tableName: "products", timestamps: true, paranoid: true,
    indexes: [{ fields: ["slug"] }, { fields: ["category_id"] }, { fields: ["is_featured"] }, { fields: ["is_active"] }],
  });
};
