const Product = require('../models/Product');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const InventoryLog = require('../models/InventoryLog');
const mongoose = require('mongoose');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const businessId = new mongoose.Types.ObjectId(req.businessId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalProducts,
      totalCategories,
      totalCustomers,
      totalSales,
      lowStockProducts,
      outOfStockProducts,
      monthlySales,
      lastMonthSales,
      inventoryValue,
      recentSales,
      recentLogs
    ] = await Promise.all([
      Product.countDocuments({ business: businessId, isActive: true }),
      Category.countDocuments({ business: businessId, isActive: true }),
      Customer.countDocuments({ business: businessId, isActive: true }),
      Sale.countDocuments({ business: businessId, status: 'completed' }),
      Product.countDocuments({
        business: businessId,
        isActive: true,
        $expr: { $and: [{ $gt: ['$stock.current', 0] }, { $lte: ['$stock.current', '$stock.minimum'] }] }
      }),
      Product.countDocuments({ business: businessId, isActive: true, 'stock.current': 0 }),
      Sale.aggregate([
        { $match: { business: businessId, status: 'completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { business: businessId, status: 'completed', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Product.aggregate([
        { $match: { business: businessId, isActive: true } },
        { $group: { _id: null, value: { $sum: { $multiply: ['$price.buying', '$stock.current'] } } } }
      ]),
      Sale.find({ business: businessId })
        .populate('customer', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('invoiceNumber total status createdAt customer customerInfo'),
      InventoryLog.find({ business: businessId })
        .populate('product', 'name sku')
        .sort({ createdAt: -1 })
        .limit(8)
        .select('type quantity product createdAt notes')
    ]);

    const currentRevenue = monthlySales[0]?.total || 0;
    const lastRevenue = lastMonthSales[0]?.total || 0;
    const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue * 100).toFixed(1) : 0;

    return successResponse(res, {
      data: {
        stats: {
          totalProducts,
          totalCategories,
          totalCustomers,
          totalSales,
          lowStockProducts,
          outOfStockProducts,
          monthlyRevenue: currentRevenue,
          monthlyOrders: monthlySales[0]?.count || 0,
          revenueGrowth: parseFloat(revenueGrowth),
          inventoryValue: inventoryValue[0]?.value || 0
        },
        recentSales,
        recentLogs
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales chart data (last 30 days)
// @route   GET /api/dashboard/charts/sales
// @access  Private
const getSalesChart = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const businessId = new mongoose.Types.ObjectId(req.businessId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesData = await Sale.aggregate([
      {
        $match: {
          business: businessId,
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days with 0
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const found = salesData.find(d => d._id === dateStr);
      result.push({
        date: dateStr,
        revenue: found ? found.revenue : 0,
        orders: found ? found.count : 0
      });
    }

    return successResponse(res, { data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise sales
// @route   GET /api/dashboard/charts/categories
// @access  Private
const getCategoryChart = async (req, res, next) => {
  try {
    const bizId = new mongoose.Types.ObjectId(req.businessId);
    const data = await Sale.aggregate([
      { $match: { business: bizId, status: 'completed' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productData'
        }
      },
      { $unwind: '$productData' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productData.category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      { $unwind: '$categoryData' },
      {
        $group: {
          _id: '$categoryData._id',
          name: { $first: '$categoryData.name' },
          color: { $first: '$categoryData.color' },
          revenue: { $sum: '$items.total' },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 }
    ]);

    return successResponse(res, { data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getSalesChart, getCategoryChart };
