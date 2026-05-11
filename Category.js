const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  color: { type: DataTypes.STRING(50), defaultValue: '#000000' },
  icon: { type: DataTypes.STRING, defaultValue: 'fa-tags' },
}, {
  tableName: 'categories'
});

module.exports = Category;
