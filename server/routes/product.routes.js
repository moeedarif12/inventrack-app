const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, deleteProductImage } = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);
router.route('/').get(getProducts).post(upload.array('images', 5), createProduct);
router.route('/:id').get(getProduct).put(upload.array('images', 5), updateProduct).delete(deleteProduct);
router.delete('/:id/images', deleteProductImage);

module.exports = router;
