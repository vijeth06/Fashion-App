const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * Enhanced Product Routes for Indian Fashion E-commerce
 * Supports filtering, sorting, search, and virtual try-on features
 */

// @route   GET /api/v1/products
// @desc    Get all products with advanced filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      subCategory,
      type,
      minPrice,
      maxPrice,
      size,
      color,
      material,
      occasion,
      brand,
      inStock,
      featured,
      bestseller,
      trending,
      newArrival,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { active: true };

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (type) query.type = type;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (material) query.material = material;
    
    if (minPrice || maxPrice) {
      query['price.selling'] = {};
      if (minPrice) query['price.selling'].$gte = Number(minPrice);
      if (maxPrice) query['price.selling'].$lte = Number(maxPrice);
    }

    if (size) {
      query['sizes.size'] = size;
      query['sizes.stock'] = { $gt: 0 };
    }

    if (color) {
      query['colors.name'] = new RegExp(color, 'i');
    }

    if (occasion) {
      query.occasion = occasion;
    }

    if (inStock === 'true') {
      query.inStock = true;
      query.totalStock = { $gt: 0 };
    }

    if (featured === 'true') query.featured = true;
    if (bestseller === 'true') query.bestseller = true;
    if (trending === 'true') query.trending = true;
    if (newArrival === 'true') query.newArrival = true;

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// @route   GET /api/v1/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const products = await Product.findFeatured(limit);
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured products',
      message: error.message
    });
  }
});

// @route   GET /api/v1/products/bestsellers
// @desc    Get bestselling products
// @access  Public
router.get('/bestsellers', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const products = await Product.find({ 
      bestseller: true, 
      active: true, 
      inStock: true 
    })
      .sort({ salesCount: -1 })
      .limit(limit)
      .lean();
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bestsellers',
      message: error.message
    });
  }
});

// @route   GET /api/v1/products/new-arrivals
// @desc    Get new arrival products
// @access  Public
router.get('/new-arrivals', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const products = await Product.find({ 
      newArrival: true, 
      active: true 
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch new arrivals',
      message: error.message
    });
  }
});

// @route   GET /api/v1/products/categories
// @desc    Get all available categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { active: true } },
      { $group: {
        _id: '$category',
        count: { $sum: 1 },
        subCategories: { $addToSet: '$subCategory' }
      }},
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
});

// @route   GET /api/v1/products/search
// @desc    Search products
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const products = await Product.searchProducts(q, { limit: Number(limit) });

    res.json({
      success: true,
      data: products,
      count: products.length,
      query: q
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

// @route   GET /api/v1/products/:productId
// @desc    Get single product by ID
// @access  Public
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      productId: req.params.productId,
      active: true
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Increment view count (don't wait for it)
    Product.findOneAndUpdate(
      { productId: req.params.productId },
      { $inc: { viewCount: 1 } }
    ).exec();

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

// @route   POST /api/v1/products/:productId/reviews
// @desc    Add product review
// @access  Private
router.post('/:productId/reviews', async (req, res) => {
  try {
    const { userId, userName, rating, comment, images } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Valid rating (1-5) is required'
      });
    }

    const product = await Product.findOne({ productId: req.params.productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    await product.addReview(userId, userName, rating, comment);

    res.json({
      success: true,
      message: 'Review added successfully',
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add review',
      message: error.message
    });
  }
});

// @route   GET /api/v1/products/:productId/similar
// @desc    Get similar products
// @access  Public
router.get('/:productId/similar', async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Find similar products based on category and type
    const similar = await Product.find({
      productId: { $ne: req.params.productId },
      $or: [
        { category: product.category },
        { type: product.type },
        { brand: product.brand }
      ],
      active: true,
      inStock: true
    })
      .limit(8)
      .lean();

    res.json({
      success: true,
      data: similar,
      count: similar.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch similar products',
      message: error.message
    });
  }
});

// @route   POST /api/v1/products/:productId/stock
// @desc    Update product stock (Admin only)
// @access  Private/Admin
router.post('/:productId/stock', async (req, res) => {
  try {
    const { size, quantity } = req.body;

    const product = await Product.findOne({ productId: req.params.productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    await product.updateStock(size, quantity);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update stock',
      message: error.message
    });
  }
});

// @route   GET /api/v1/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1, sort = '-createdAt' } = req.query;

    const products = await Product.findByCategory(category, {
      limit: Number(limit),
      sort
    });

    const total = await Product.countDocuments({ category, active: true });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

module.exports = router;
