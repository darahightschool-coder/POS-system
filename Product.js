const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  barcode: { type: DataTypes.STRING, unique: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  costPrice: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  minStock: { type: DataTypes.INTEGER, defaultValue: 10 },
  unit: { type: DataTypes.STRING(50), defaultValue: 'pcs' },
  image: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'products'
});

module.exports = Product;
