"use strict";

const { Op }      = require("sequelize");
const { Product, Category, ProductPlan, Review } = require("../models");

/** GET /api/products */
exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort = "featured", featured, page = 1, limit = 12 } = req.query;
    const where = { isActive: true };
    const order = [];

    if (category) {
      const cat = await Category.findOne({ where: { slug: category, isActive: true } });
      if (cat) where.categoryId = cat.id;
    }
    if (search) {
      where[Op.or] = [
        { name:             { [Op.like]: `%${search}%` } },
        { shortDescription: { [Op.like]: `%${search}%` } },
      ];
    }
    if (featured === "true") where.isFeatured = true;

    switch (sort) {
      case "price-asc":  order.push(["basePrice", "ASC"]);   break;
      case "price-desc": order.push(["basePrice", "DESC"]);  break;
      case "rating":     order.push(["avgRating", "DESC"]);  break;
      case "newest":     order.push(["createdAt", "DESC"]);  break;
      case "popular":    order.push(["salesCount", "DESC"]); break;
      default:           order.push(["sortOrder", "ASC"], ["isFeatured", "DESC"]); break;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: products, count: total } = await Product.findAndCountAll({
      where, order, limit: parseInt(limit), offset,
      include: [
        { model: Category,    as: "category", attributes: ["id", "name", "slug", "icon"] },
        { model: ProductPlan, as: "plans",    where: { isActive: true }, required: false, order: [["sortOrder", "ASC"]] },
      ],
    });

    return res.json({
      success: true, data: products,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/products/:slug */
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug, isActive: true },
      include: [
        { model: Category,    as: "category", attributes: ["id", "name", "slug", "icon"] },
        { model: ProductPlan, as: "plans",    where: { isActive: true }, required: false, order: [["sortOrder", "ASC"]] },
        { model: Review,      as: "reviews",  where: { isApproved: true }, required: false, limit: 10, order: [["createdAt", "DESC"]] },
      ],
    });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.json({ success: true, data: product });
  } catch (error) {
    console.error("Get product error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** POST /api/products [ADMIN] */
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      basePrice:     parseFloat(req.body.basePrice),
      originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : null,
      features:      req.body.features || [],
      isActive:      true,
    });
    return res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ success: false, message: "Product slug already exists" });
    }
    console.error("Create product error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** PUT /api/products/:id [ADMIN] */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    await product.update(req.body);
    return res.json({ success: true, message: "Product updated", data: product });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** DELETE /api/products/:id [ADMIN] — soft delete */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    await product.destroy();
    return res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/categories */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [["sortOrder", "ASC"]],
    });
    const withCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.count({ where: { categoryId: cat.id, isActive: true } });
        return { ...cat.toJSON(), productCount: count };
      })
    );
    return res.json({ success: true, data: withCount });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
