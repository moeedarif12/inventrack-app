const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  sku: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  images: [{
    type: String
  }],
  price: {
    buying: {
      type: Number,
      required: [true, 'Buying price is required'],
      min: [0, 'Price cannot be negative']
    },
    selling: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Price cannot be negative']
    }
  },
  stock: {
    current: { type: Number, default: 0, min: 0 },
    minimum: { type: Number, default: 10, min: 0 },
    maximum: { type: Number, default: null }
  },
  unit: {
    type: String,
    default: 'pcs',
    enum: ['pcs', 'kg', 'g', 'ltr', 'ml', 'box', 'pack', 'dozen', 'set', 'pair', 'roll', 'm', 'ft']
  },
  barcode: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index
productSchema.index({ sku: 1, business: 1 }, { unique: true });
productSchema.index({ name: 'text', description: 'text', sku: 'text' });

// Virtual: stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock.current <= 0) return 'out_of_stock';
  if (this.stock.current <= this.stock.minimum) return 'low_stock';
  return 'in_stock';
});

// Virtual: profit margin
productSchema.virtual('profitMargin').get(function() {
  if (!this.price.buying || !this.price.selling) return 0;
  return ((this.price.selling - this.price.buying) / this.price.buying * 100).toFixed(2);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
