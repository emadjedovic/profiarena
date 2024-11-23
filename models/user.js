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
        model: Role,
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
    // hr only
    company_name: {
      type: DataTypes.STRING(255),
    },
    // talent only
    address: {
      type: DataTypes.TEXT,
    },
    // talent only
    date_of_birth: {
      type: DataTypes.DATE,
    },
    // talent only
    about: {
      type: DataTypes.TEXT,
    },
    // talent only
    education: {
      type: DataTypes.TEXT,
    },
     // talent only
    skills: {
      type: DataTypes.TEXT,
    },
     // talent only
    languages: {
      type: DataTypes.TEXT,
    },
     // talent only
    socials: {
      type: DataTypes.TEXT,
    },
     // talent only
    cv: {
      type: DataTypes.STRING(255),
    },
     // talent only
    projects: {
      type: DataTypes.STRING(255),
    },
     // talent only
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
