const User = require('../models/User');
const Business = require('../models/Business');

const getAllCustomers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('business');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Server error fetching customers' });
  }
};

const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().populate('owner', 'name email');
    res.status(200).json({ success: true, count: businesses.length, data: businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching businesses' });
  }
};

const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });
    res.status(200).json({ success: true, data: business });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating business' });
  }
};

const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });
    // Note: In production you'd want to also delete related users, products, sales, etc.
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting business' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['owner', 'admin', 'staff'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user role' });
  }
};

module.exports = {
  getAllCustomers,
  getAllBusinesses,
  updateBusiness,
  deleteBusiness,
  deleteUser,
  updateUserRole
};