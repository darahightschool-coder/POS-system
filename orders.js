const express = require('express');
const { Order, OrderItem, Product, InventoryLog, sequelize } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: OrderItem, include: [Product] }]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders (Checkout)
router.post('/', authMiddleware, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { items, paymentMethod, amountPaid, discount, notes } = req.body;

    let subtotal = 0;
    const orderItemsData = [];

    // Verify stock and calculate subtotal
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (!product || !product.isActive) {
        throw new Error(`Product ID ${item.productId} not found or inactive`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal
      });

      // Update Stock
      const previousStock = product.stock;
      const newStock = previousStock - item.quantity;
      product.stock = newStock;
      await product.save({ transaction });

      // Create Inventory Log
      await InventoryLog.create({
        productId: product.id,
        userId: req.user.id,
        type: 'sale',
        quantity: item.quantity,
        previousStock,
        newStock,
        reason: 'Order checkout'
      }, { transaction });
    }

    const total = subtotal - (discount || 0);
    const changeAmount = amountPaid - total;

    if (amountPaid < total) {
      throw new Error('Amount paid is less than total');
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `INV-${dateStr}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const order = await Order.create({
      orderNumber,
      userId: req.user.id,
      subtotal,
      discount: discount || 0,
      total,
      paymentMethod,
      amountPaid,
      changeAmount,
      status: 'completed',
      notes
    }, { transaction });

    // Link Order Items
    for (const item of orderItemsData) {
      item.orderId = order.id;
    }
    await OrderItem.bulkCreate(orderItemsData, { transaction });

    // Fetch complete order with items and products for receipt
    const createdOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, include: [Product] }],
      transaction
    });

    await transaction.commit();
    res.status(201).json({ message: 'Order completed', order: createdOrder });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem }],
      transaction
    });

    if (!order) throw new Error('Order not found');
    if (order.status === 'cancelled') throw new Error('Order already cancelled');

    order.status = 'cancelled';
    await order.save({ transaction });

    // Restore stock
    for (const item of order.OrderItems) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (product) {
        const previousStock = product.stock;
        const newStock = previousStock + item.quantity;
        product.stock = newStock;
        await product.save({ transaction });

        await InventoryLog.create({
          productId: product.id,
          userId: req.user.id,
          type: 'return',
          quantity: item.quantity,
          previousStock,
          newStock,
          reason: `Order ${order.orderNumber} cancelled`
        }, { transaction });
      }
    }

    await transaction.commit();
    res.json({ message: 'Order cancelled and stock restored' });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
