export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'staff';
  business: string | Business;
  lastLogin?: string;
  createdAt: string;
}

export interface Business {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  description?: string;
  logo?: string;
  currency: string;
  taxRate: number;
  lowStockThreshold: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  settings: {
    invoicePrefix: string;
    skuPrefix: string;
    allowNegativeStock: boolean;
    darkMode: boolean;
  };
  owner: string | User;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  business: string;
  productCount?: number;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  category: Category | string;
  business: string;
  images: string[];
  price: { buying: number; selling: number };
  stock: { current: number; minimum: number; maximum?: number };
  unit: string;
  barcode?: string;
  tags: string[];
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  profitMargin: number;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  notes?: string;
  totalPurchases: number;
  totalSpent: number;
  business: string;
  isActive: boolean;
  createdAt: string;
}

export interface SaleItem {
  product: string | Product;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Sale {
  _id: string;
  invoiceNumber: string;
  business: string;
  customer?: Customer | string;
  customerInfo?: { name?: string; email?: string; phone?: string };
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: { rate: number; amount: number };
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'refunded';
  status: 'completed' | 'cancelled' | 'pending' | 'refunded';
  notes?: string;
  soldBy?: User | string;
  createdAt: string;
}

export interface InventoryLog {
  _id: string;
  product: Product | string;
  business: string;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'sale' | 'return' | 'damage' | 'initial';
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  notes?: string;
  performedBy?: User | string;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalSales: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  revenueGrowth: number;
  inventoryValue: number;
}

export interface SalesChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: Pagination;
}
