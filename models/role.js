const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db_connect');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
});


module.exports = Role;
