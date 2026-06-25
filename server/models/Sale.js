const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  sku: { type: String },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  total: {
    type: Number,
    required: true
  }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  items: [saleItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'online', 'cheque', 'other', 'Cash', 'Card', 'Bank Transfer', 'Mobile Payment', 'Mobile Wallet', 'Cheque'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'partial', 'refunded'],
    default: 'paid'
  },
  status: {
    type: String,
    enum: ['completed', 'cancelled', 'pending', 'refunded'],
    default: 'completed'
  },
  notes: {
    type: String,
    maxlength: [500]
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

saleSchema.index({ createdAt: -1 });
saleSchema.index({ customer: 1, business: 1 });

module.exports = mongoose.model('Sale', saleSchema);
