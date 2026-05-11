const express = require('express');
const { Order, OrderItem, Product, Category, sequelize } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');
const moment = require('moment'); // We should use simple date objects if we don't install moment

const router = express.Router();

// GET /api/reports/dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Today's Revenue
    const todayOrders = await Order.findAll({
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: startOfDay }
      }
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    // Monthly Revenue
    const monthOrders = await Order.findAll({
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: startOfMonth }
      }
    });
    const monthlyRevenue = monthOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    // Total Orders Today
    const todayOrderCount = todayOrders.length;

    // Low stock count
    const lowStockCount = await Product.count({
      where: {
        isActive: true,
        stock: {
          [Op.lte]: sequelize.col('minStock')
        }
      }
    });

    res.json({
      todayRevenue,
      monthlyRevenue,
      todayOrderCount,
      lowStockCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/sales-by-day (Last 7 Days)
router.get('/sales-by-day', authMiddleware, async (req, res) => {
  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 6);
    daysAgo.setHours(0, 0, 0, 0);

    const orders = await Order.findAll({
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: daysAgo }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('SUM', sequelize.col('total')), 'revenue']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/top-products
router.get('/top-products', authMiddleware, async (req, res) => {
  try {
    const topProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
      ],
      include: [{ model: Product, attributes: ['name', 'price'] }],
      group: ['productId', 'Product.id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 5
    });

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
