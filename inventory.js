const express = require('express');
const { Product, InventoryLog, User, sequelize } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/inventory/logs
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const logs = await InventoryLog.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        { model: Product, attributes: ['id', 'name', 'barcode'] },
        { model: User, attributes: ['id', 'name'] }
      ],
      limit: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/low-stock
router.get('/low-stock', authMiddleware, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        isActive: true,
        stock: {
          [Op.lte]: sequelize.col('minStock')
        }
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inventory/adjust
router.post('/adjust', authMiddleware, adminMiddleware, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { productId, type, quantity, reason } = req.body; // type: 'in', 'out', 'adjustment'

    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const product = await Product.findByPk(productId, { transaction });
    if (!product) throw new Error('Product not found');

    const previousStock = product.stock;
    let newStock = previousStock;

    if (type === 'in') {
      newStock += parseInt(quantity);
    } else if (type === 'out') {
      if (previousStock < quantity) throw new Error('Insufficient stock for outgoing adjustment');
      newStock -= parseInt(quantity);
    } else if (type === 'adjustment') {
      newStock = parseInt(quantity); // For absolute override
    } else {
      throw new Error('Invalid adjustment type');
    }

    product.stock = newStock;
    await product.save({ transaction });

    const log = await InventoryLog.create({
      productId,
      userId: req.user.id,
      type,
      quantity: type === 'adjustment' ? Math.abs(newStock - previousStock) : quantity,
      previousStock,
      newStock,
      reason: reason || 'Manual adjustment'
    }, { transaction });

    await transaction.commit();
    res.json({ message: 'Stock adjusted successfully', product, log });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
