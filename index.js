const sequelize = require('./database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const InventoryLog = require('./InventoryLog');

// Define Relationships

// Category <-> Product
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Product <-> InventoryLog
Product.hasMany(InventoryLog, { foreignKey: 'productId', onDelete: 'CASCADE' });
InventoryLog.belongsTo(Product, { foreignKey: 'productId' });

// User <-> InventoryLog
User.hasMany(InventoryLog, { foreignKey: 'userId' });
InventoryLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  InventoryLog
};
