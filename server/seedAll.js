require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Business = require('./models/Business');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Sale = require('./models/Sale');
const InventoryLog = require('./models/InventoryLog');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_db';
    console.log(`Connecting to database at: ${mongoUri.split('@')[1] || mongoUri}...`);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000
    });
    console.log('✅ Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Business.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Sale.deleteMany({});
    await InventoryLog.deleteMany({});
    console.log('🗑️ Database cleared.');

    // 1. Create Admin
    console.log('Creating Admin account...');
    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    await adminUser.save();
    console.log('👤 Admin user created (email: admin@example.com, password: admin123)');

    // 2. Create Business 1 (Supermart) and its Owner
    console.log('Creating Business 1 (Supermart) & Owner...');
    const business1 = new Business({
      name: 'Supermart',
      email: 'supermart@example.com',
      phone: '03001234567',
      website: 'www.supermart.com',
      description: 'Your friendly neighborhood grocery store.',
      address: {
        street: 'Main Market Road',
        city: 'Lahore',
        state: 'Punjab',
        zipCode: '54000',
        country: 'Pakistan'
      },
      currency: 'PKR',
      taxRate: 5,
      lowStockThreshold: 15,
      isActive: true
    });
    await business1.save();

    const owner1 = new User({
      name: 'John Doe',
      email: 'owner1@example.com',
      password: 'owner123',
      role: 'owner',
      business: business1._id,
      isActive: true
    });
    await owner1.save();

    business1.owner = owner1._id;
    await business1.save();
    console.log('🏪 Business 1: Supermart created. Owner: owner1@example.com / owner123');

    // 3. Create Categories for Business 1
    console.log('Creating categories for Supermart...');
    const catGroceries = new Category({
      name: 'Groceries',
      description: 'Daily household food items and dry groceries',
      color: '#4f46e5',
      icon: 'shopping-bag',
      business: business1._id
    });
    await catGroceries.save();

    const catBeverages = new Category({
      name: 'Beverages',
      description: 'Soft drinks, juices, soda, water, and hot beverages',
      color: '#06b6d4',
      icon: 'coffee',
      business: business1._id
    });
    await catBeverages.save();

    // 4. Create Products for Business 1
    console.log('Creating products for Supermart...');
    const prodRice = new Product({
      name: 'Basmati Rice 5kg',
      sku: 'SM-RICE-01',
      description: 'Premium long grain basmati rice pack',
      category: catGroceries._id,
      business: business1._id,
      price: {
        buying: 800,
        selling: 1000
      },
      stock: {
        current: 50,
        minimum: 10
      },
      unit: 'pcs',
      isActive: true
    });
    await prodRice.save();

    const prodCoke = new Product({
      name: 'Coca Cola 1.5L',
      sku: 'SM-COKE-01',
      description: '1.5 Liter carbonated soft drink bottle',
      category: catBeverages._id,
      business: business1._id,
      price: {
        buying: 120,
        selling: 150
      },
      stock: {
        current: 120,
        minimum: 20
      },
      unit: 'pcs',
      isActive: true
    });
    await prodCoke.save();

    // 5. Create Customer for Business 1
    console.log('Creating customer for Supermart...');
    const cust1 = new Customer({
      name: 'Imran Khan',
      email: 'imran@example.com',
      phone: '03217654321',
      address: {
        street: 'Model Town',
        city: 'Lahore',
        state: 'Punjab',
        country: 'Pakistan'
      },
      business: business1._id,
      totalPurchases: 1,
      totalSpent: 2750,
      isActive: true
    });
    await cust1.save();

    // 6. Create Sale for Business 1
    console.log('Creating sale record for Supermart...');
    const sale1 = new Sale({
      invoiceNumber: 'INV-SM-001',
      business: business1._id,
      customer: cust1._id,
      customerInfo: {
        name: cust1.name,
        email: cust1.email,
        phone: cust1.phone
      },
      items: [
        {
          product: prodRice._id,
          name: prodRice.name,
          sku: prodRice.sku,
          quantity: 2,
          unitPrice: 1000,
          discount: 0,
          total: 2000
        },
        {
          product: prodCoke._id,
          name: prodCoke.name,
          sku: prodCoke.sku,
          quantity: 5,
          unitPrice: 150,
          discount: 0,
          total: 750
        }
      ],
      subtotal: 2750,
      discount: 0,
      tax: {
        rate: 5,
        amount: 137.5
      },
      total: 2887.5,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      status: 'completed',
      soldBy: owner1._id
    });
    await sale1.save();

    // 7. Inventory Logs for Business 1
    console.log('Logging inventory actions for Supermart...');
    // Initial Stock Logs
    await new InventoryLog({
      product: prodRice._id,
      business: business1._id,
      type: 'initial',
      quantity: 52,
      previousStock: 0,
      newStock: 52,
      notes: 'Initial database seeding stock',
      performedBy: owner1._id
    }).save();

    await new InventoryLog({
      product: prodCoke._id,
      business: business1._id,
      type: 'initial',
      quantity: 125,
      previousStock: 0,
      newStock: 125,
      notes: 'Initial database seeding stock',
      performedBy: owner1._id
    }).save();

    // Sale Stock Logs
    await new InventoryLog({
      product: prodRice._id,
      business: business1._id,
      type: 'sale',
      quantity: -2,
      previousStock: 52,
      newStock: 50,
      reference: 'INV-SM-001',
      notes: 'Stock reduction from sale',
      performedBy: owner1._id,
      sale: sale1._id
    }).save();

    await new InventoryLog({
      product: prodCoke._id,
      business: business1._id,
      type: 'sale',
      quantity: -5,
      previousStock: 125,
      newStock: 120,
      reference: 'INV-SM-001',
      notes: 'Stock reduction from sale',
      performedBy: owner1._id,
      sale: sale1._id
    }).save();


    // 8. Create Business 2 (Tech Gizmos) and its Owner
    console.log('Creating Business 2 (Tech Gizmos) & Owner...');
    const business2 = new Business({
      name: 'Tech Gizmos',
      email: 'gizmos@example.com',
      phone: '03339876543',
      website: 'www.techgizmos.com',
      description: 'Leading provider of computer accessories and gadgets.',
      address: {
        street: 'Hafeez Center',
        city: 'Lahore',
        state: 'Punjab',
        zipCode: '54660',
        country: 'Pakistan'
      },
      currency: 'PKR',
      taxRate: 10,
      lowStockThreshold: 8,
      isActive: true
    });
    await business2.save();

    const owner2 = new User({
      name: 'Jane Smith',
      email: 'owner2@example.com',
      password: 'owner123',
      role: 'owner',
      business: business2._id,
      isActive: true
    });
    await owner2.save();

    business2.owner = owner2._id;
    await business2.save();
    console.log('🏪 Business 2: Tech Gizmos created. Owner: owner2@example.com / owner123');

    // 9. Create Categories for Business 2
    console.log('Creating categories for Tech Gizmos...');
    const catElectronics = new Category({
      name: 'Electronics',
      description: 'Major electronic hardware and components',
      color: '#e11d48',
      icon: 'cpu',
      business: business2._id
    });
    await catElectronics.save();

    const catAccessories = new Category({
      name: 'Accessories',
      description: 'Cables, keyboards, mice, chargers and other add-ons',
      color: '#16a34a',
      icon: 'mouse',
      business: business2._id
    });
    await catAccessories.save();

    // 10. Create Products for Business 2
    console.log('Creating products for Tech Gizmos...');
    const prodMouse = new Product({
      name: 'Wireless Mouse',
      sku: 'TG-MOUSE-01',
      description: '2.4GHz optical ergonomic wireless mouse',
      category: catAccessories._id,
      business: business2._id,
      price: {
        buying: 600,
        selling: 900
      },
      stock: {
        current: 30,
        minimum: 5
      },
      unit: 'pcs',
      isActive: true
    });
    await prodMouse.save();

    const prodCable = new Product({
      name: 'USB-C Cable',
      sku: 'TG-CABLE-01',
      description: 'Fast charging high speed braided USB-C cable 1m',
      category: catAccessories._id,
      business: business2._id,
      price: {
        buying: 150,
        selling: 300
      },
      stock: {
        current: 150,
        minimum: 15
      },
      unit: 'pcs',
      isActive: true
    });
    await prodCable.save();

    // 11. Create Customer for Business 2
    console.log('Creating customer for Tech Gizmos...');
    const cust2 = new Customer({
      name: 'Sara Ahmed',
      email: 'sara@example.com',
      phone: '03339876543',
      address: {
        street: 'Gulberg III',
        city: 'Lahore',
        state: 'Punjab',
        country: 'Pakistan'
      },
      business: business2._id,
      totalPurchases: 1,
      totalSpent: 1500,
      isActive: true
    });
    await cust2.save();

    // 12. Create Sale for Business 2
    console.log('Creating sale record for Tech Gizmos...');
    const sale2 = new Sale({
      invoiceNumber: 'INV-TG-001',
      business: business2._id,
      customer: cust2._id,
      customerInfo: {
        name: cust2.name,
        email: cust2.email,
        phone: cust2.phone
      },
      items: [
        {
          product: prodMouse._id,
          name: prodMouse.name,
          sku: prodMouse.sku,
          quantity: 1,
          unitPrice: 900,
          discount: 0,
          total: 900
        },
        {
          product: prodCable._id,
          name: prodCable.name,
          sku: prodCable.sku,
          quantity: 2,
          unitPrice: 300,
          discount: 0,
          total: 600
        }
      ],
      subtotal: 1500,
      discount: 0,
      tax: {
        rate: 10,
        amount: 150
      },
      total: 1650,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      status: 'completed',
      soldBy: owner2._id
    });
    await sale2.save();

    // 13. Inventory Logs for Business 2
    console.log('Logging inventory actions for Tech Gizmos...');
    // Initial Stock Logs
    await new InventoryLog({
      product: prodMouse._id,
      business: business2._id,
      type: 'initial',
      quantity: 31,
      previousStock: 0,
      newStock: 31,
      notes: 'Initial database seeding stock',
      performedBy: owner2._id
    }).save();

    await new InventoryLog({
      product: prodCable._id,
      business: business2._id,
      type: 'initial',
      quantity: 152,
      previousStock: 0,
      newStock: 152,
      notes: 'Initial database seeding stock',
      performedBy: owner2._id
    }).save();

    // Sale Stock Logs
    await new InventoryLog({
      product: prodMouse._id,
      business: business2._id,
      type: 'sale',
      quantity: -1,
      previousStock: 31,
      newStock: 30,
      reference: 'INV-TG-001',
      notes: 'Stock reduction from sale',
      performedBy: owner2._id,
      sale: sale2._id
    }).save();

    await new InventoryLog({
      product: prodCable._id,
      business: business2._id,
      type: 'sale',
      quantity: -2,
      previousStock: 152,
      newStock: 150,
      reference: 'INV-TG-001',
      notes: 'Stock reduction from sale',
      performedBy: owner2._id,
      sale: sale2._id
    }).save();

    console.log('🏁 Database seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
};

seedDatabase();
