const express = require('express');
const router = express.Router();
const { getDashboardStats, getSalesChart, getCategoryChart } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/charts/sales', getSalesChart);
router.get('/charts/categories', getCategoryChart);

module.exports = router;
