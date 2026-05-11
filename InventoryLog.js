const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const InventoryLog = sequelize.define('InventoryLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.ENUM('in', 'out', 'adjustment', 'sale', 'return'), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  previousStock: { type: DataTypes.INTEGER, allowNull: false },
  newStock: { type: DataTypes.INTEGER, allowNull: false },
  reason: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'inventory_logs'
});

module.exports = InventoryLog;
