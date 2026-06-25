const Category = require('../models/Category');
const Product = require('../models/Product');
const { successResponse, errorResponse, paginationMeta } = require('../utils/apiResponse');

// @desc    Get all categories for business
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const query = { business: req.businessId, isActive: true };
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await Category.countDocuments(query);
    const categories = await Category.find(query)
      .populate('productCount')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return successResponse(res, {
      data: categories,
      pagination: paginationMeta(total, page, limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, business: req.businessId });
    if (!category) return errorResponse(res, { message: 'Category not found.', statusCode: 404 });
    return successResponse(res, { data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  try {
    const { name, description, color, icon } = req.body;
    const category = await Category.create({
      name,
      description,
      color: color || '#6366f1',
      icon: icon || 'tag',
      business: req.businessId
    });
    return successResponse(res, { message: 'Category created successfully.', data: category, statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, business: req.businessId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!category) return errorResponse(res, { message: 'Category not found.', statusCode: 404 });
    return successResponse(res, { message: 'Category updated successfully.', data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments({ category: req.params.id, business: req.businessId });
    if (productCount > 0) {
      return errorResponse(res, {
        message: `Cannot delete category with ${productCount} products. Reassign products first.`,
        statusCode: 400
      });
    }
    const category = await Category.findOneAndDelete({ _id: req.params.id, business: req.businessId });
    if (!category) return errorResponse(res, { message: 'Category not found.', statusCode: 404 });
    return successResponse(res, { message: 'Category deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
