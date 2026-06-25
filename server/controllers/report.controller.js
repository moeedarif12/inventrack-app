const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const InventoryLog = require('../models/InventoryLog');
const mongoose = require('mongoose');
const { successResponse } = require('../utils/apiResponse');

// @desc    Sales report
// @route   GET /api/reports/sales
// @access  Private
const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const bizId = new mongoose.Types.ObjectId(req.businessId);
    const match = { business: bizId, status: 'completed' };

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    const formatMap = { day: '%Y-%m-%d', week: '%Y-W%V', month: '%Y-%m', year: '%Y' };
    const format = formatMap[groupBy] || '%Y-%m-%d';

    const [summary, trend, topProducts] = await Promise.all([
      Sale.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' },
            totalDiscount: { $sum: '$discount' },
            totalTax: { $sum: '$tax.amount' }
          }
        }
      ]),
      Sale.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Sale.aggregate([
        { $match: match },
        { $unwind: '$items' },
        { $group: { _id: '$items.product', name: { $first: '$items.name' }, sku: { $first: '$items.sku' }, totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.total' } } },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
      ])
    ]);

    return successResponse(res, { data: { summary: summary[0] || {}, trend, topProducts } });
  } catch (error) {
    next(error);
  }
};

// @desc    Inventory report
// @route   GET /api/reports/inventory
// @access  Private
const getInventoryReport = async (req, res, next) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.businessId);

    const [products, lowStock, outOfStock, categoryBreakdown] = await Promise.all([
      Product.find({ business: businessId, isActive: true }).populate('category', 'name color').select('name sku stock price category').sort({ 'stock.current': 1 }),
      Product.countDocuments({ business: businessId, isActive: true, $expr: { $and: [{ $gt: ['$stock.current', 0] }, { $lte: ['$stock.current', '$stock.minimum'] }] } }),
      Product.countDocuments({ business: businessId, isActive: true, 'stock.current': 0 }),
      Product.aggregate([
        { $match: { business: businessId, isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stock.current' }, totalValue: { $sum: { $multiply: ['$price.buying', '$stock.current'] } } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $project: { name: '$category.name', color: '$category.color', count: 1, totalStock: 1, totalValue: 1 } },
        { $sort: { totalValue: -1 } }
      ])
    ]);

    const totalValue = products.reduce((sum, p) => sum + (p.price.buying * p.stock.current), 0);

    return successResponse(res, { data: { products, summary: { totalProducts: products.length, lowStock, outOfStock, totalValue }, categoryBreakdown } });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer report
// @route   GET /api/reports/customers
// @access  Private
const getCustomerReport = async (req, res, next) => {
  try {
    const topCustomers = await Customer.find({ business: req.businessId, isActive: true })
      .sort({ totalSpent: -1 })
      .limit(20)
      .select('name email phone totalPurchases totalSpent createdAt');

    const summary = await Customer.aggregate([
      { $match: { business: new mongoose.Types.ObjectId(req.businessId), isActive: true } },
      { $group: { _id: null, total: { $sum: 1 }, totalSpent: { $sum: '$totalSpent' }, avgSpent: { $avg: '$totalSpent' } } }
    ]);

    return successResponse(res, { data: { topCustomers, summary: summary[0] || {} } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSalesReport, getInventoryReport, getCustomerReport };
