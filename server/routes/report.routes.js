const express = require('express');
const router = express.Router();
const { getSalesReport, getInventoryReport, getCustomerReport } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);
router.get('/customers', getCustomerReport);

module.exports = router;
