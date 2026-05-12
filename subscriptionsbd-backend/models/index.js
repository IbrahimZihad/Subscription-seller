"use strict";

const { Sequelize } = require("sequelize");
const config = require("../config/database.js");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database, dbConfig.username, dbConfig.password,
  {
    host:           dbConfig.host,
    port:           dbConfig.port,
    dialect:        dbConfig.dialect,
    logging:        dbConfig.logging,
    pool:           dbConfig.pool,
    define:         dbConfig.define,
    dialectOptions: dbConfig.dialectOptions,
  }
);

// ── Import models ─────────────────────────────────────────────
const User        = require("./User")(sequelize, Sequelize.DataTypes);
const Category    = require("./Category")(sequelize, Sequelize.DataTypes);
const Product     = require("./Product")(sequelize, Sequelize.DataTypes);
const ProductPlan = require("./ProductPlan")(sequelize, Sequelize.DataTypes);
const BlogPost    = require("./BlogPost")(sequelize, Sequelize.DataTypes);
const Order       = require("./Order")(sequelize, Sequelize.DataTypes);
const OrderItem   = require("./OrderItem")(sequelize, Sequelize.DataTypes);
const Review      = require("./Review")(sequelize, Sequelize.DataTypes);
const Coupon      = require("./Coupon")(sequelize, Sequelize.DataTypes);
const Payment     = require("./Payment")(sequelize, Sequelize.DataTypes);
const Wishlist    = require("./Wishlist")(sequelize, Sequelize.DataTypes);

// ── Associations ──────────────────────────────────────────────
User.hasMany(Order,    { foreignKey: "userId",    as: "orders" });
Order.belongsTo(User,  { foreignKey: "userId",    as: "user" });

User.hasMany(Review,   { foreignKey: "userId",    as: "reviews" });
Review.belongsTo(User, { foreignKey: "userId",    as: "user" });

User.hasMany(Wishlist,    { foreignKey: "userId", as: "wishlist" });
Wishlist.belongsTo(User,  { foreignKey: "userId", as: "user" });

Category.hasMany(Product,    { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category,  { foreignKey: "categoryId", as: "category" });

Product.hasMany(ProductPlan, { foreignKey: "productId", as: "plans" });
ProductPlan.belongsTo(Product, { foreignKey: "productId", as: "product" });

Product.hasMany(Review,   { foreignKey: "productId", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "productId", as: "product" });

Product.hasMany(Wishlist,    { foreignKey: "productId", as: "wishlists" });
Wishlist.belongsTo(Product,  { foreignKey: "productId", as: "product" });

Order.hasMany(OrderItem,    { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order,  { foreignKey: "orderId", as: "order" });

Order.hasOne(Payment,    { foreignKey: "orderId", as: "payment" });
Payment.belongsTo(Order, { foreignKey: "orderId", as: "order" });

Product.hasMany(OrderItem,    { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product,  { foreignKey: "productId", as: "product" });

ProductPlan.hasMany(OrderItem,   { foreignKey: "planId", as: "orderItems" });
OrderItem.belongsTo(ProductPlan, { foreignKey: "planId", as: "plan" });

Coupon.hasMany(Order,   { foreignKey: "couponId", as: "orders" });
Order.belongsTo(Coupon, { foreignKey: "couponId", as: "coupon" });

module.exports = {
  sequelize, Sequelize,
  User, Category, Product, ProductPlan,
  BlogPost, Order, OrderItem, Review,
  Coupon, Payment, Wishlist,
};
