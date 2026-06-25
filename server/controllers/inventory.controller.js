const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { successResponse, errorResponse, paginationMeta } = require('../utils/apiResponse');

// @desc    Stock In
// @route   POST /api/inventory/stock-in
// @access  Private
const stockIn = async (req, res, next) => {
  try {
    const { product: productId, quantity, reference, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return errorResponse(res, { message: 'Quantity must be a positive number.', statusCode: 400 });
    }

    const product = await Product.findOne({ _id: productId, business: req.businessId, isActive: true });
    if (!product) return errorResponse(res, { message: 'Product not found.', statusCode: 404 });

    const previousStock = product.stock.current;
    const newStock = previousStock + parseInt(quantity);

    await Product.findByIdAndUpdate(productId, { 'stock.current': newStock });

    const log = await InventoryLog.create({
      product: productId,
      business: req.businessId,
      type: 'stock_in',
      quantity: parseInt(quantity),
      previousStock,
      newStock,
      reference,
      notes,
      performedBy: req.user.id
    });

    return successResponse(res, {
      message: `Stock increased by ${quantity} units.`,
      data: { log, newStock },
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stock Out
// @route   POST /api/inventory/stock-out
// @access  Private
const stockOut = async (req, res, next) => {
  try {
    const { product: productId, quantity, reference, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return errorResponse(res, { message: 'Quantity must be a positive number.', statusCode: 400 });
    }

    const product = await Product.findOne({ _id: productId, business: req.businessId, isActive: true });
    if (!product) return errorResponse(res, { message: 'Product not found.', statusCode: 404 });

    if (product.stock.current < quantity) {
      return errorResponse(res, {
        message: `Insufficient stock. Current stock: ${product.stock.current}`,
        statusCode: 400
      });
    }

    const previousStock = product.stock.current;
    const newStock = previousStock - parseInt(quantity);

    await Product.findByIdAndUpdate(productId, { 'stock.current': newStock });

    const log = await InventoryLog.create({
      product: productId,
      business: req.businessId,
      type: 'stock_out',
      quantity: -parseInt(quantity),
      previousStock,
      newStock,
      reference,
      notes,
      performedBy: req.user.id
    });

    return successResponse(res, { message: `Stock decreased by ${quantity} units.`, data: { log, newStock }, statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust stock (set to exact value)
// @route   POST /api/inventory/adjust
// @access  Private
const adjustStock = async (req, res, next) => {
  try {
    const { product: productId, newQuantity, notes } = req.body;

    if (newQuantity === undefined || newQuantity < 0) {
      return errorResponse(res, { message: 'New quantity must be a non-negative number.', statusCode: 400 });
    }

    const product = await Product.findOne({ _id: productId, business: req.businessId, isActive: true });
    if (!product) return errorResponse(res, { message: 'Product not found.', statusCode: 404 });

    const previousStock = product.stock.current;
    const newStock = parseInt(newQuantity);
    const diff = newStock - previousStock;

    await Product.findByIdAndUpdate(productId, { 'stock.current': newStock });

    const log = await InventoryLog.create({
      product: productId,
      business: req.businessId,
      type: 'adjustment',
      quantity: diff,
      previousStock,
      newStock,
      notes: notes || `Manual adjustment from ${previousStock} to ${newStock}`,
      performedBy: req.user.id
    });

    return successResponse(res, { message: 'Stock adjusted successfully.', data: { log, newStock }, statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory logs
// @route   GET /api/inventory/logs
// @access  Private
const getLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, product, type, startDate, endDate } = req.query;
    const query = { business: req.businessId };

    if (product) query.product = product;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    const total = await InventoryLog.countDocuments(query);
    const logs = await InventoryLog.find(query)
      .populate('product', 'name sku')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return successResponse(res, { data: logs, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock products
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStock = async (req, res, next) => {
  try {
    const products = await Product.find({
      business: req.businessId,
      isActive: true,
      $expr: { $lte: ['$stock.current', '$stock.minimum'] }
    }).populate('category', 'name color').sort({ 'stock.current': 1 });

    return successResponse(res, { data: products });
  } catch (error) {
    next(error);
  }
};

module.exports = { stockIn, stockOut, adjustStock, getLogs, getLowStock };
