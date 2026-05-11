const express = require('express');
const { Category } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/categories
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    const category = await Category.create({ name, color, icon });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    await category.update({ name, color, icon });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
