const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../db/db_connect'); // Adjust this to point to your database configuration

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    zipCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1000,
        max: 99999,
      },
    },
  },
  {
    timestamps: true, // Automatically handles createdAt and updatedAt
  }
);

// Virtual attribute for fullName
User.prototype.fullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

module.exports = User;
