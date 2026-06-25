const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const InventoryLog = require('../models/InventoryLog');
const Business = require('../models/Business');
const mongoose = require('mongoose');
const generateInvoiceNumber = require('../utils/generateInvoice');
const { successResponse, errorResponse, paginationMeta } = require('../utils/apiResponse');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, startDate, endDate, customer, search } = req.query;
    const query = { business: req.businessId };

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (customer) query.customer = customer;
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .populate('customer', 'name email phone')
      .populate('soldBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return successResponse(res, { data: sales, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findOne({ _id: req.params.id, business: req.businessId })
      .populate('customer', 'name email phone address')
      .populate('items.product', 'name sku images')
      .populate('soldBy', 'name email');

    if (!sale) return errorResponse(res, { message: 'Sale not found.', statusCode: 404 });

    const business = await Business.findById(req.businessId).select('name email phone address currency logo');
    return successResponse(res, { data: { sale, business } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create sale
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res, next) => {
  try {
    const { customer, customerInfo, items, discount = 0, paymentMethod = 'cash', notes } = req.body;

    if (!items || items.length === 0) {
      return errorResponse(res, { message: 'Sale must have at least one item.', statusCode: 400 });
    }

    // Get business settings
    const business = await Business.findById(req.businessId);
    const taxRate = business?.taxRate || 0;
    const invoicePrefix = business?.settings?.invoicePrefix || 'INV';

    // Validate products and calculate totals
    const saleItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findOne({ _id: item.product, business: req.businessId, isActive: true });
      if (!product) {
        return errorResponse(res, { message: `Product not found: ${item.product}`, statusCode: 404 });
      }

      if (!business.settings?.allowNegativeStock && product.stock.current < item.quantity) {
        return errorResponse(res, {
          message: `Insufficient stock for "${product.name}". Available: ${product.stock.current}`,
          statusCode: 400
        });
      }

      const itemDiscount = item.discount || 0;
      const itemTotal = item.quantity * item.unitPrice * (1 - itemDiscount / 100);
      subtotal += itemTotal;

      saleItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: itemDiscount,
        total: itemTotal
      });
    }

    // Client sends discount as absolute amount in currency, not percentage
    const discountAmount = parseFloat(discount) || 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * taxRate) / 100;
    const total = afterDiscount + taxAmount;

    const invoiceNumber = await generateInvoiceNumber(Sale, req.businessId, invoicePrefix);

    const sale = await Sale.create({
      invoiceNumber,
      business: req.businessId,
      customer: customer || null,
      customerInfo,
      items: saleItems,
      subtotal,
      discount: discountAmount,
      tax: { rate: taxRate, amount: taxAmount },
      total,
      paymentMethod,
      paymentStatus: 'paid',
      status: 'completed',
      notes,
      soldBy: req.user.id
    });

    // Deduct stock and log inventory changes
    for (const item of saleItems) {
      const product = await Product.findById(item.product);
      const previousStock = product.stock.current;
      const newStock = Math.max(0, previousStock - item.quantity);

      await Product.findByIdAndUpdate(item.product, { 'stock.current': newStock });

      await InventoryLog.create({
        product: item.product,
        business: req.businessId,
        type: 'sale',
        quantity: -item.quantity,
        previousStock,
        newStock,
        reference: invoiceNumber,
        notes: `Sale: ${invoiceNumber}`,
        performedBy: req.user.id,
        sale: sale._id
      });
    }

    // Update customer stats
    if (customer) {
      await Customer.findByIdAndUpdate(customer, {
        $inc: { totalPurchases: 1, totalSpent: total }
      });
    }

    return successResponse(res, { message: 'Sale created successfully.', data: sale, statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sale status
// @route   PATCH /api/sales/:id/status
// @access  Private
const updateSaleStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const sale = await Sale.findOneAndUpdate(
      { _id: req.params.id, business: req.businessId },
      { $set: updates },
      { new: true }
    );
    if (!sale) return errorResponse(res, { message: 'Sale not found.', statusCode: 404 });
    return successResponse(res, { message: 'Sale status updated.', data: sale });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSales, getSale, createSale, updateSaleStatus };
