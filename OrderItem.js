const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  tableName: 'order_items'
});

module.exports = OrderItem;
