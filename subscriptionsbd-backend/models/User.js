"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id:                    { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    firebaseUid:           { type: DataTypes.STRING(128), allowNull: true, unique: true, field: "firebase_uid" },
    name:                  { type: DataTypes.STRING(100), allowNull: false },
    email:                 { type: DataTypes.STRING(191), allowNull: false, unique: true, validate: { isEmail: true } },
    phone:                 { type: DataTypes.STRING(20), allowNull: true },
    password:              { type: DataTypes.STRING(255), allowNull: true },
    role:                  { type: DataTypes.ENUM("customer", "admin", "moderator"), defaultValue: "customer" },
    avatar:                { type: DataTypes.STRING(500), allowNull: true },
    provider:              { type: DataTypes.ENUM("email", "google", "facebook"), defaultValue: "email" },
    isEmailVerified:       { type: DataTypes.BOOLEAN, defaultValue: false, field: "is_email_verified" },
    isActive:              { type: DataTypes.BOOLEAN, defaultValue: true, field: "is_active" },
    paymentPhone:          { type: DataTypes.STRING(20), allowNull: true, field: "payment_phone" },
    lastLoginAt:           { type: DataTypes.DATE, allowNull: true, field: "last_login_at" },
    resetPasswordToken:    { type: DataTypes.STRING(255), allowNull: true, field: "reset_password_token" },
    resetPasswordExpires:  { type: DataTypes.DATE, allowNull: true, field: "reset_password_expires" },
  }, {
    tableName: "users",
    timestamps: true,
    paranoid: true,
    indexes: [{ fields: ["email"] }, { fields: ["firebase_uid"] }, { fields: ["role"] }],
  });

  User.prototype.toJSON = function () {
    const v = { ...this.get() };
    delete v.password;
    delete v.resetPasswordToken;
    delete v.resetPasswordExpires;
    return v;
  };

  return User;
};
