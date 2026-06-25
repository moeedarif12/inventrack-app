const Business = require('../models/Business');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get business profile
// @route   GET /api/business
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const business = await Business.findById(req.businessId).populate('owner', 'name email');
    if (!business) {
      return errorResponse(res, { message: 'Business not found.', statusCode: 404 });
    }
    return successResponse(res, { data: business });
  } catch (error) {
    next(error);
  }
};

// @desc    Update business profile
// @route   PUT /api/business
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'email', 'phone', 'website', 'description', 'address', 'currency', 'taxRate', 'lowStockThreshold', 'settings'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.file) {
      updates.logo = `/uploads/products/${req.file.filename}`;
    }

    const business = await Business.findByIdAndUpdate(
      req.businessId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    return successResponse(res, { message: 'Business profile updated successfully.', data: business });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
