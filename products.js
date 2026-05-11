const express = require('express');
const { Product, Category } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// GET /api/products
router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/barcode/:code
router.get('/barcode/:code', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { barcode: req.params.code, isActive: true },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products
router.post('/', authMiddleware, adminMiddleware, upload.single('imageFile'), async (req, res) => {
  try {
    if (req.file) {
      req.body.image = `http://localhost:5000/uploads/${req.file.filename}`;
    }
    if (req.body.categoryId === '' || req.body.categoryId === 'null') req.body.categoryId = null;
    if (req.body.barcode === '' || req.body.barcode === 'null') req.body.barcode = null;

    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, adminMiddleware, upload.single('imageFile'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (req.file) {
      req.body.image = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    if (req.body.categoryId === '' || req.body.categoryId === 'null') req.body.categoryId = null;
    if (req.body.barcode === '' || req.body.barcode === 'null') req.body.barcode = null;

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id (Soft delete)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.update({ isActive: false });
    res.json({ message: 'Product deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
