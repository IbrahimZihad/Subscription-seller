"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const NOW = Sequelize.literal("CURRENT_TIMESTAMP");
    const NOW_UPDATE = Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

    // ── 1. USERS ─────────────────────────────────────────────
    await queryInterface.createTable("users", {
      id:                     { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      firebase_uid:           { type: Sequelize.STRING(128), allowNull: true, unique: true },
      name:                   { type: Sequelize.STRING(100), allowNull: false },
      email:                  { type: Sequelize.STRING(191), allowNull: false, unique: true },
      phone:                  { type: Sequelize.STRING(20), allowNull: true },
      password:               { type: Sequelize.STRING(255), allowNull: true },
      role:                   { type: Sequelize.ENUM("customer","admin","moderator"), defaultValue: "customer" },
      avatar:                 { type: Sequelize.STRING(500), allowNull: true },
      provider:               { type: Sequelize.ENUM("email","google","facebook"), defaultValue: "email" },
      is_email_verified:      { type: Sequelize.BOOLEAN, defaultValue: false },
      is_active:              { type: Sequelize.BOOLEAN, defaultValue: true },
      payment_phone:          { type: Sequelize.STRING(20), allowNull: true },
      last_login_at:          { type: Sequelize.DATE, allowNull: true },
      reset_password_token:   { type: Sequelize.STRING(255), allowNull: true },
      reset_password_expires: { type: Sequelize.DATE, allowNull: true },
      createdAt:              { type: Sequelize.DATE, allowNull: false, defaultValue: NOW },
      updatedAt:              { type: Sequelize.DATE, allowNull: false, defaultValue: NOW_UPDATE },
      deletedAt:              { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex("users", ["email"]);
    await queryInterface.addIndex("users", ["firebase_uid"]);

    // ── 2. CATEGORIES ─────────────────────────────────────────
    await queryInterface.createTable("categories", {
      id:         { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name:       { type: Sequelize.STRING(100), allowNull: false, unique: true },
      slug:       { type: Sequelize.STRING(120), allowNull: false, unique: true },
      icon:       { type: Sequelize.STRING(10), allowNull: true },
      description:{ type: Sequelize.TEXT, allowNull: true },
      sort_order: { type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0 },
      is_active:  { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:  { type: Sequelize.DATE, allowNull: false, defaultValue: NOW },
      updatedAt:  { type: Sequelize.DATE, allowNull: false, defaultValue: NOW_UPDATE },
    });

    // ── 3. PRODUCTS ───────────────────────────────────────────
    await queryInterface.createTable("products", {
      id:                { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      category_id:       { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: "categories", key: "id" }, onDelete: "RESTRICT" },
      name:              { type: Sequelize.STRING(200), allowNull: false },
      slug:              { type: Sequelize.STRING(220), allowNull: false, unique: true },
      short_description: { type: Sequelize.STRING(500), allowNull: true },
      description:       { type: Sequelize.TEXT("long"), allowNull: true },
      image:             { type: Sequelize.STRING(500), allowNull: true },
      badge:             { type: Sequelize.STRING(50), allowNull: true },
      base_price:        { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      original_price:    { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      delivery_time:     { type: Sequelize.STRING(50), defaultValue: "Instant" },
      features:          { type: Sequelize.JSON, allowNull: true },
      avg_rating:        { type: Sequelize.DECIMAL(3, 2), defaultValue: 0 },
      review_count:      { type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0 },
      sales_count:       { type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0 },
      is_featured:       { type: Sequelize.BOOLEAN, defaultValue: false },
      in_stock:          { type: Sequelize.BOOLEAN, defaultValue: true },
      is_active:         { type: Sequelize.BOOLEAN, defaultValue: true },
      meta_title:        { type: Sequelize.STRING(200), allowNull: true },
      meta_description:  { type: Sequelize.STRING(500), allowNull: true },
      sort_order:        { type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0 },
      createdAt:         { type: Sequelize.DATE, allowNull: false, defaultValue: NOW },
      updatedAt:         { type: Sequelize.DATE, allowNull: false, defaultValue: NOW_UPDATE },
      deletedAt:         { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex("products", ["slug"]);
    await queryInterface.addIndex("products", ["category_id"]);
    await queryInterface.addIndex("products", ["is_featured"]);

    // ── 4. PRODUCT PLANS ──────────────────────────────────────
    await queryInterface.createTable("product_plans", {
      id:             { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      product_id:     { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: "products", key: "id" }, onDelete: "CASCADE" },
      name:           { type: Sequelize.STRING(100), allowNull: false },
      duration:       { type: Sequelize.STRING(50), allowNull: false },
      duration_days:  { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      price:          { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      original_price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      features:       { type: Sequelize.JSON, allowNull: true },
      is_popular:     { type: Sequelize.BOOLEAN, defaultValue: false },
      is_active:      { type: Sequelize.BOOLEAN, defaultValue: true },
      sort_order:     { type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0 },
      createdAt:      { type: Sequelize.DATE, allowNull: false, defaultValue: NOW },
      updatedAt:      { type: Sequelize.DATE, allowNull: false, defaultValue: NOW_UPDATE },
    });
    await queryInterface.addIndex("product_plans", ["product_id"]);

    // ── 5. COUPONS ────────────────────────────────────────────
    await queryInterface.createTable("coupons", {
      id:               { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      code:             { type: Sequelize.STRING(50), allowNull: false, unique: true },
      description:      { type: Sequelize.STRING(255), allowNull: true },
      discount_type:    { type: Sequelize.ENUM("percentage","fixed"), defaultValue: "percentage" },
      discount_value:   { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      min_order_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      max_discount:     { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      usage_limit:      { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      used_count:       { type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0 },
      per_user_limit:   { type: Sequelize.INTEGER.UNSIGNED, defaultValue: 1 },
      starts_at:        { type: Sequelize.DATE, allowNull: true },
      expires_at:       { type: Sequelize.DATE, allowNull: true },
      is_active:        { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:        { type: Sequelize.DATE, allowNull: false, defaultValue: NOW },
      updatedAt:        { type: Sequelize.DATE, allowNull: false, defaultValue: NOW_UPDATE },
    });

    // ── 6. ORDERS ─────────────────────────────────────────────
    await queryInterface.createTable("orders", {
      id:              { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      order_number:    { type: Sequelize.STRING(20), allowNull: false, unique: true },
      user_id:         { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: "users", key: "id" }, onDelete: "SET NULL" },
      coupon_id:       { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: "coupons", key: "id" }, onDelete: "SET NULL" },
      status:          { type: Sequelize.ENUM("pending","paid","processing","delivered","completed","cancelled","refunded"), defaultValue: "pending" },
      payment_status:  { type: Sequelize.ENUM("unpaid","paid","failed","refunded"), defaultValue: "unpaid" },
      payment_method:  { type: Sequelize.ENUM("bkash","nagad","rocket","sslcommerz","bank"), allowNull: true },
      customer_name:   { type: Sequelize.STRING(100), allowNull: false },
      customer_phone:  { type: Sequelize.STRING(20), allowNull: false },
      customer_email:  { type: Sequelize.STRING(191), allowNull: true },
      subtotal:        { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      discount_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      total:           { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      transaction_id:  { type: Sequelize.STRING(100), allowNull: true },
      notes:           { type: Sequelize.TEXT, allowNull: true },
      admin_notes:     { type: Sequelize.TEXT, allowNull: true },
      delivery_data:   { type: Sequelize.TEXT("long"), allowNull: true },
      delivered_at:    { type: Sequelize.DATE, allowNull: true },
      paid_at:         { type: Sequelize.DATE, allowNull: true },
      createdAt:       { type: Sequelize.DATE, allowNull: false, defaultValue: NOW },
      updatedAt:       { type: Sequelize.DATE, allowNull: false, defaultValue: NOW_UPDATE },
    });
    await queryInterface.addIndex("orders", ["order_number"]);
    await queryInterface.addIndex("orders", ["user_id"]);
    await queryInterface.addIndex("orders", ["status"]);

    // ── 7. ORDER ITEMS ────────────────────────────────────────
    await queryInterface.createTable("order_items", {
      id:           { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      order_id:     { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: "orders", key: "id" }, onDelete: "CASCADE" },
      product_id:   { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: "products", key: "id" }, onDelete: "RESTRICT" },
      plan_id:      { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: "product_plans", key: "id" }, onDelete: "SET NULL" },
      product_name: { type: Sequelize.STRING(200), allowNull: false },
      plan_name:    { type: Sequelize.STRING(100), allowNull: true },
      unit_price:   { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      quantity:     { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      subtotal:     { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      createdAt:    { type: Sequelize.DATE, allowNull: false, defaultValue: NOW },
      updatedAt:    { type: Sequelize.DATE, allowNull: false, defaultValue: NOW_UPDATE },
    });
    await queryInterface.addIndex("order_items", ["order_id"]);

    // ── 8. PAYMENTS ───────────────────────────────────────────
    await queryInterface.createTable("payments", {
      id:               { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      order_id:         { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, unique: true, references: { model: "orders", key: "id" }, onDelete: "CASCADE" },
      method:           { type: Sequelize.ENUM("bkash","nagad","rocket","sslcommerz","bank"), allowNull: false },
      amount:           { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency:         { type: Sequelize.STRING(5), defaultValue: "BDT" },
      status:           { type: Sequelize.ENUM("pending","success","failed","cancelled","refunded"), defaultValue: "pending" },
      transaction_id:   { type: Sequelize.STRING(100), allowNull: true },
      sender_number:    { type: Sequelize.STRING(20), allowNull: true },
      ssl_session_key:  { type: Sequelize.STRING(255), allowNull: true },
      ssl_val_id:       { type: Sequelize.STRING(255), allowNull: true },
      ssl_bank_txn_id:  { type: Sequelize.STRING(255), allowNull: true },
      ssl_card_type:    { type: Sequelize.STRING(50), allowNull: true },
      gateway_response: { type: Sequelize.JSON, allowNull: true },
      paid_at:          { type: Sequelize.DATE, allowNull: true },
      refunded_at:      { type: Sequelize.DATE, allowNull: true },
      refund_amount:    { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      notes:            { type: Sequelize.TEXT, allowNull: true },
      createdAt:        { type: Sequelize.DATE, allowNull: false, defaultValue: NOW },
      updatedAt:        { type: Sequelize.DATE, allowNull: false, defaultValue: NOW_UPDATE },
    });
    await queryInterface.addIndex("payments", ["order_id"]);
    await queryInterface.addIndex("payments", ["transaction_id"]);

    // ── 9. REVIEWS ────────────────────────────────────────────
    await queryInterface.createTable("reviews", {
      id:                   { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      product_id:           { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: "products", key: "id" }, onDelete: "CASCADE" },
      user_id:              { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: "users", key: "id" }, onDelete: "SET NULL" },
      order_id:             { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: "orders", key: "id" }, onDelete: "SET NULL" },
      reviewer_name:        { type: Sequelize.STRING(100), allowNull: false },
      reviewer_role:        { type: Sequelize.STRING(100), allowNull: true },
      rating:               { type: Sequelize.TINYINT.UNSIGNED, allowNull: false },
      title:                { type: Sequelize.STRING(200), allowNull: true },
      body:                 { type: Sequelize.TEXT, allowNull: false },
      is_verified_purchase: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_approved:          { type: Sequelize.BOOLEAN, defaultValue: false },
      helpful_count:        { type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0 },
      createdAt:            { type: Sequelize.DATE, allowNull: false, defaultValue: NOW },
      updatedAt:            { type: Sequelize.DATE, allowNull: false, defaultValue: NOW_UPDATE },
    });
    await queryInterface.addIndex("reviews", ["product_id"]);
    await queryInterface.addIndex("reviews", ["is_approved"]);

    // ── 10. BLOG POSTS ────────────────────────────────────────
    await queryInterface.createTable("blog_posts", {
      id:               { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      title:            { type: Sequelize.STRING(300), allowNull: false },
      slug:             { type: Sequelize.STRING(320), allowNull: false, unique: true },
      excerpt:          { type: Sequelize.STRING(500), allowNull: true },
      content:          { type: Sequelize.TEXT("long"), allowNull: false },
      cover_image:      { type: Sequelize.STRING(500), allowNull: true },
      category:         { type: Sequelize.ENUM("Guide","Comparison","Review","List","News","Tutorial"), defaultValue: "Guide" },
      author:           { type: Sequelize.STRING(100), allowNull: false, defaultValue: "Subscriptions BD" },
      tags:             { type: Sequelize.JSON, allowNull: true },
      read_time:        { type: Sequelize.STRING(30), allowNull: true },
      view_count:       { type: Sequelize.INTEGER.UNSIGNED, defaultValue: 0 },
      is_published:     { type: Sequelize.BOOLEAN, defaultValue: false },
      published_at:     { type: Sequelize.DATE, allowNull: true },
      meta_title:       { type: Sequelize.STRING(200), allowNull: true },
      meta_description: { type: Sequelize.STRING(500), allowNull: true },
      createdAt:        { type: Sequelize.DATE, allowNull: false, defaultValue: NOW },
      updatedAt:        { type: Sequelize.DATE, allowNull: false, defaultValue: NOW_UPDATE },
      deletedAt:        { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex("blog_posts", ["slug"]);
    await queryInterface.addIndex("blog_posts", ["is_published"]);

    // ── 11. WISHLISTS ─────────────────────────────────────────
    await queryInterface.createTable("wishlists", {
      id:         { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id:    { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: "users", key: "id" }, onDelete: "CASCADE" },
      product_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: "products", key: "id" }, onDelete: "CASCADE" },
      createdAt:  { type: Sequelize.DATE, allowNull: false, defaultValue: NOW },
      updatedAt:  { type: Sequelize.DATE, allowNull: false, defaultValue: NOW_UPDATE },
    });
    await queryInterface.addIndex("wishlists", ["user_id", "product_id"], { unique: true });

    console.log("✅ All 11 tables created");
  },

  async down(queryInterface) {
    const tables = ["wishlists","reviews","blog_posts","payments","order_items","orders","coupons","product_plans","products","categories","users"];
    for (const t of tables) await queryInterface.dropTable(t);
    console.log("✅ All tables dropped");
  },
};
