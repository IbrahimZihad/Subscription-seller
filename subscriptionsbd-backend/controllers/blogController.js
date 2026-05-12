"use strict";

const { BlogPost } = require("../models");
const { Op }       = require("sequelize");

/** GET /api/blog — list published posts */
exports.getPosts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 9 } = req.query;
    const where = { isPublished: true };
    if (category && category !== "All") where.category = category;
    if (search) where.title = { [Op.like]: `%${search}%` };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: posts, count: total } = await BlogPost.findAndCountAll({
      where,
      order:      [["publishedAt", "DESC"]],
      limit:      parseInt(limit),
      offset,
      attributes: { exclude: ["content"] }, // exclude full content from listing
    });

    return res.json({
      success: true,
      data: posts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/blog/:slug — single post with full content */
exports.getPost = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ where: { slug: req.params.slug, isPublished: true } });
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    await post.increment("viewCount");
    return res.json({ success: true, data: post });
  } catch (error) {
    console.error("Get post error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** POST /api/blog [ADMIN] — create a new post */
exports.createPost = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.isPublished && !data.publishedAt) data.publishedAt = new Date();

    const post = await BlogPost.create(data);
    return res.status(201).json({ success: true, message: "Post created", data: post });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ success: false, message: "Slug already exists" });
    }
    console.error("Create post error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** PUT /api/blog/:id [ADMIN] — update a post */
exports.updatePost = async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const data = { ...req.body };
    // Set publishedAt if publishing for the first time
    if (data.isPublished && !post.publishedAt) data.publishedAt = new Date();

    await post.update(data);
    return res.json({ success: true, message: "Post updated", data: post });
  } catch (error) {
    console.error("Update post error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** DELETE /api/blog/:id [ADMIN] — soft delete */
exports.deletePost = async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    await post.destroy();
    return res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("Delete post error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/blog/categories — distinct blog categories with counts */
exports.getBlogCategories = async (req, res) => {
  try {
    const categories = ["Guide", "Comparison", "Review", "List", "News", "Tutorial"];
    const counts = await Promise.all(
      categories.map(async (cat) => {
        const count = await BlogPost.count({ where: { category: cat, isPublished: true } });
        return { name: cat, count };
      })
    );
    return res.json({ success: true, data: counts.filter((c) => c.count > 0) });
  } catch (error) {
    console.error("Get blog categories error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /api/blog/related/:slug — get 3 related posts by same category */
exports.getRelatedPosts = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ where: { slug: req.params.slug }, attributes: ["id", "category"] });
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const related = await BlogPost.findAll({
      where: { isPublished: true, category: post.category, id: { [Op.ne]: post.id } },
      order: [["publishedAt", "DESC"]],
      limit: 3,
      attributes: { exclude: ["content"] },
    });

    return res.json({ success: true, data: related });
  } catch (error) {
    console.error("Get related posts error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
