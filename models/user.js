const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../db/db_connect');
const Role = require('./role');  // Assuming Role is in the same directory

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,  // Reference to the Role model
        key: 'id',
      },
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    company_name: {
      type: DataTypes.STRING(255),
    },
    address: {
      type: DataTypes.TEXT,
    },
    date_of_birth: {
      type: DataTypes.DATE,
    },
    about: {
      type: DataTypes.TEXT,
    },
    education: {
      type: DataTypes.TEXT,
    },
    skills: {
      type: DataTypes.TEXT,
    },
    languages: {
      type: DataTypes.TEXT,
    },
    socials: {
      type: DataTypes.TEXT,
    },
    cv: {
      type: DataTypes.STRING(255),
    },
    projects: {
      type: DataTypes.STRING(255),
    },
    certificates: {
      type: DataTypes.STRING(255),
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          user.password = hashedPassword;
        }
      },
      beforeUpdate: async (user) => {
        if (user.password) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          user.password = hashedPassword;
        }
      },
    },
  }
);

User.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
