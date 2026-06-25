const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const { successResponse, errorResponse, paginationMeta } = require('../utils/apiResponse');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = { business: req.businessId, isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return successResponse(res, { data: customers, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, business: req.businessId });
    if (!customer) return errorResponse(res, { message: 'Customer not found.', statusCode: 404 });

    // Get purchase history
    const purchases = await Sale.find({ customer: customer._id, business: req.businessId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('invoiceNumber total status createdAt items');

    return successResponse(res, { data: { customer, purchases } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create({ ...req.body, business: req.businessId });
    return successResponse(res, { message: 'Customer created successfully.', data: customer, statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, business: req.businessId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!customer) return errorResponse(res, { message: 'Customer not found.', statusCode: 404 });
    return successResponse(res, { message: 'Customer updated successfully.', data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer (soft)
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, business: req.businessId },
      { isActive: false },
      { new: true }
    );
    if (!customer) return errorResponse(res, { message: 'Customer not found.', statusCode: 404 });
    return successResponse(res, { message: 'Customer deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
