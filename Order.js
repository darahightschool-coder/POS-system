const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  paymentMethod: { type: DataTypes.ENUM('cash', 'card', 'qr'), defaultValue: 'cash' },
  amountPaid: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  changeAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  status: { type: DataTypes.ENUM('completed', 'cancelled'), defaultValue: 'completed' },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'orders'
});

module.exports = Order;
