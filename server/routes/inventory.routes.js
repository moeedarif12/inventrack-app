const express = require('express');
const router = express.Router();
const { stockIn, stockOut, adjustStock, getLogs, getLowStock } = require('../controllers/inventory.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/stock-in', stockIn);
router.post('/stock-out', stockOut);
router.post('/adjust', adjustStock);
router.get('/logs', getLogs);
router.get('/low-stock', getLowStock);

module.exports = router;
