"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("BlogPost", {
    id:              { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    title:           { type: DataTypes.STRING(300), allowNull: false },
    slug:            { type: DataTypes.STRING(320), allowNull: false, unique: true },
    excerpt:         { type: DataTypes.STRING(500), allowNull: true },
    content:         { type: DataTypes.TEXT("long"), allowNull: false },
    coverImage:      { type: DataTypes.STRING(500), allowNull: true, field: "cover_image" },
    category:        { type: DataTypes.ENUM("Guide","Comparison","Review","List","News","Tutorial"), defaultValue: "Guide" },
    author:          { type: DataTypes.STRING(100), allowNull: false, defaultValue: "Subscriptions BD" },
    tags:            { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    readTime:        { type: DataTypes.STRING(30), allowNull: true, field: "read_time" },
    viewCount:       { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0, field: "view_count" },
    isPublished:     { type: DataTypes.BOOLEAN, defaultValue: false, field: "is_published" },
    publishedAt:     { type: DataTypes.DATE, allowNull: true, field: "published_at" },
    metaTitle:       { type: DataTypes.STRING(200), allowNull: true, field: "meta_title" },
    metaDescription: { type: DataTypes.STRING(500), allowNull: true, field: "meta_description" },
  }, {
    tableName: "blog_posts", timestamps: true, paranoid: true,
    indexes: [{ fields: ["slug"], unique: true }, { fields: ["is_published"] }, { fields: ["category"] }],
  });
};
