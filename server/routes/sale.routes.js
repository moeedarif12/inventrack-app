const express = require('express');
const router = express.Router();
const { getSales, getSale, createSale, updateSaleStatus } = require('../controllers/sale.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.route('/').get(getSales).post(createSale);
router.route('/:id').get(getSale);
router.patch('/:id/status', updateSaleStatus);

module.exports = router;
