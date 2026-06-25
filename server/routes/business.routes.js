const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/business.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', protect, getProfile);
router.put('/', protect, upload.single('logo'), updateProfile);

module.exports = router;
