"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Category", {
    id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name:        { type: DataTypes.STRING(100), allowNull: false, unique: true },
    slug:        { type: DataTypes.STRING(120), allowNull: false, unique: true },
    icon:        { type: DataTypes.STRING(10), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    sortOrder:   { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0, field: "sort_order" },
    isActive:    { type: DataTypes.BOOLEAN, defaultValue: true, field: "is_active" },
  }, { tableName: "categories", timestamps: true });
};
