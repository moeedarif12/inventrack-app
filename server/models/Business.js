const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [200, 'Business name cannot exceed 200 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  email: {
    type: String,
    required: [true, 'Business email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'Pakistan' },
    zipCode: { type: String, trim: true }
  },
  logo: {
    type: String,
    default: null
  },
  currency: {
    type: String,
    default: 'PKR',
    enum: ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR']
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0
  },
  settings: {
    invoicePrefix: { type: String, default: 'INV' },
    skuPrefix: { type: String, default: 'SKU' },
    allowNegativeStock: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Business', businessSchema);
