const Product = require('../models/Product');
const Category = require('../models/Category');
const InventoryLog = require('../models/InventoryLog');
const generateSKU = require('../utils/generateSKU');
const { successResponse, errorResponse, paginationMeta } = require('../utils/apiResponse');
const fs = require('fs');
const path = require('path');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', category, stockStatus, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { business: req.businessId, isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;

    if (stockStatus === 'low_stock') {
      query.$expr = { $lte: ['$stock.current', '$stock.minimum'] };
    } else if (stockStatus === 'out_of_stock') {
      query['stock.current'] = 0;
    } else if (stockStatus === 'in_stock') {
      query['stock.current'] = { $gt: 0 };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name color icon')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return successResponse(res, {
      data: products,
      pagination: paginationMeta(total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, business: req.businessId })
      .populate('category', 'name color icon');
    if (!product) return errorResponse(res, { message: 'Product not found.', statusCode: 404 });
    return successResponse(res, { data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, stock, unit, barcode, tags } = req.body;

    // Validate category belongs to business
    const cat = await Category.findOne({ _id: category, business: req.businessId });
    if (!cat) return errorResponse(res, { message: 'Category not found.', statusCode: 404 });

    // Parse JSON fields if they came as strings
    const parsedPrice = typeof price === 'string' ? JSON.parse(price) : price;
    const parsedStock = typeof stock === 'string' ? JSON.parse(stock) : stock;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

    // Get business settings for SKU prefix
    const Business = require('../models/Business');
    const business = await Business.findById(req.businessId);
    const skuPrefix = business?.settings?.skuPrefix || 'SKU';

    const sku = generateSKU(skuPrefix, cat.name);

    const images = req.files ? req.files.map(f => `/uploads/products/${f.filename}`) : [];

    const product = await Product.create({
      name,
      description,
      sku,
      category,
      business: req.businessId,
      images,
      price: parsedPrice,
      stock: parsedStock || { current: 0, minimum: 10 },
      unit: unit || 'pcs',
      barcode,
      tags: parsedTags || []
    });

    // Log initial stock if provided
    if (parsedStock?.current > 0) {
      await InventoryLog.create({
        product: product._id,
        business: req.businessId,
        type: 'initial',
        quantity: parsedStock.current,
        previousStock: 0,
        newStock: parsedStock.current,
        notes: 'Initial stock on product creation',
        performedBy: req.user.id
      });
    }

    const populated = await product.populate('category', 'name color icon');
    return successResponse(res, { message: 'Product created successfully.', data: populated, statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, business: req.businessId });
    if (!product) return errorResponse(res, { message: 'Product not found.', statusCode: 404 });

    const { name, description, category, price, stock, unit, barcode, tags, isActive } = req.body;

    const parsedPrice = typeof price === 'string' ? JSON.parse(price) : price;
    const parsedStock = typeof stock === 'string' ? JSON.parse(stock) : stock;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (parsedPrice) product.price = parsedPrice;
    if (parsedStock) product.stock = parsedStock;
    if (unit) product.unit = unit;
    if (barcode !== undefined) product.barcode = barcode;
    if (parsedTags) product.tags = parsedTags;
    if (isActive !== undefined) product.isActive = isActive;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => `/uploads/products/${f.filename}`);
      product.images = [...product.images, ...newImages];
    }

    await product.save();
    const populated = await product.populate('category', 'name color icon');
    return successResponse(res, { message: 'Product updated successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, business: req.businessId },
      { isActive: false },
      { new: true }
    );
    if (!product) return errorResponse(res, { message: 'Product not found.', statusCode: 404 });
    return successResponse(res, { message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/images
// @access  Private
const deleteProductImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    const product = await Product.findOne({ _id: req.params.id, business: req.businessId });
    if (!product) return errorResponse(res, { message: 'Product not found.', statusCode: 404 });

    product.images = product.images.filter(img => img !== imageUrl);
    await product.save();

    // Try to delete file from disk
    const filePath = path.join(__dirname, '..', imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return successResponse(res, { message: 'Image removed.', data: product });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, deleteProductImage };
