const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');
const { getAllCustomers, getAllBusinesses, updateBusiness, deleteBusiness, deleteUser, updateUserRole } = require('../controllers/admin.controller');

const router = express.Router();

router.get('/customers', protect, adminOnly, getAllCustomers);
router.get('/businesses', protect, adminOnly, getAllBusinesses);
router.put('/businesses/:id', protect, adminOnly, updateBusiness);
router.delete('/businesses/:id', protect, adminOnly, deleteBusiness);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;