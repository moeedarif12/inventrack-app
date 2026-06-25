const User = require('../models/User');
const Business = require('../models/Business');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Register a new business + owner
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, businessName, businessEmail, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, { message: 'An account with this email already exists.', statusCode: 409 });
    }

    // Create business first
    const business = await Business.create({
      name: businessName || `${name}'s Business`,
      email: businessEmail || email,
      phone: phone || '',
      owner: null // will update after user creation
    });

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      business: business._id,
      role: 'owner'
    });

    // Update business owner reference
    business.owner = user._id;
    await business.save();

    const token = user.generateToken();

    return successResponse(res, {
      message: 'Account created successfully!',
      statusCode: 201,
      data: { user, business, token }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, { message: 'Please provide email and password.', statusCode: 400 });
    }

    const user = await User.findOne({ email }).select('+password').populate('business');
    if (!user) {
      return errorResponse(res, { message: 'Invalid email or password.', statusCode: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, { message: 'Invalid email or password.', statusCode: 401 });
    }

    if (!user.isActive) {
      return errorResponse(res, { message: 'Your account has been deactivated.', statusCode: 403 });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateToken();

    return successResponse(res, {
      message: 'Login successful!',
      data: { user, business: user.business, token }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('business');
    return successResponse(res, { data: { user, business: user.business } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, { message: 'Current password is incorrect.', statusCode: 400 });
    }

    user.password = newPassword;
    await user.save();

    const token = user.generateToken();
    return successResponse(res, { message: 'Password updated successfully.', data: { token } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (name)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return errorResponse(res, { message: 'Name is required.', statusCode: 400 });
    }

    const user = await User.findById(req.user.id).populate('business');
    if (!user) {
      return errorResponse(res, { message: 'User not found.', statusCode: 404 });
    }

    user.name = name;
    await user.save();

    return successResponse(res, { message: 'Profile updated successfully.', data: { user } });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updatePassword, updateProfile };

