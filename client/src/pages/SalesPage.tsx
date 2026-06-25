import React, { useEffect, useState, useCallback } from 'react';
import { saleAPI, productAPI, customerAPI } from '@/lib/api';
import type { Sale, Product, Customer } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, ShoppingCart, Plus, Minus, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage or fixed? Let's use fixed discount per item
}

export default function SalesPage() {
  const { business } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'new'>('history');
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // POS State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [discountVal, setDiscountVal] = useState(0); // overall invoice discount
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | 'partial'>('paid');
  const [saleStatus] = useState<'completed' | 'pending'>('completed');
  const [notes, setNotes] = useState('');
  const [submittingSale, setSubmittingSale] = useState(false);

  // Filters
  const [searchHistory, setSearchHistory] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPages, setHistoryPages] = useState(1);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const res = await saleAPI.getAll({ page: historyPage, limit: 10, search: searchHistory });
      setSales(res.data.data);
      if (res.data.pagination) {
        setHistoryPages(res.data.pagination.pages);
      }
    } catch {
      toast.error('Failed to load sales history');
    } finally {
      setLoading(false);
    }
  }, [historyPage, searchHistory]);

  const loadPOSData = useCallback(async () => {
    try {
      const [prodRes, custRes] = await Promise.all([
        productAPI.getAll({ limit: 100, search: productSearch }),
        customerAPI.getAll({ limit: 100 }),
      ]);
      setProducts(prodRes.data.data.filter((p: Product) => p.isActive));
      setCustomers(custRes.data.data);
    } catch {
      toast.error('Failed to load POS details');
    }
  }, [productSearch]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchSales();
    } else {
      loadPOSData();
    }
  }, [activeTab, fetchSales, loadPOSData]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock.current <= 0 && !business?.settings?.allowNegativeStock) {
      return toast.error('Product is out of stock!');
    }

    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock.current && !business?.settings?.allowNegativeStock) {
          toast.error('Cannot add more than available stock!');
          return prev;
        }
        return prev.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.price.selling, discount: 0 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (productId: string, val: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product._id === productId) {
          const newQty = Math.max(1, item.quantity + val);
          if (newQty > item.product.stock.current && !business?.settings?.allowNegativeStock && val > 0) {
            toast.error('Quantity exceeds available stock!');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const taxRate = business?.taxRate || 0;
  const taxAmount = Math.round((subtotal - discountVal) * (taxRate / 100));
  const total = Math.max(0, subtotal - discountVal + taxAmount);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return toast.error('Your cart is empty!');

    setSubmittingSale(true);
    try {
      const items = cart.map(item => ({
        product: item.product._id,
        name: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: (item.unitPrice - item.discount) * item.quantity,
      }));

      const payload = {
        customer: selectedCustomerId || undefined,
        customerInfo: !selectedCustomerId && walkInName ? { name: walkInName, phone: walkInPhone } : undefined,
        items,
        subtotal,
        discount: discountVal,
        tax: { rate: taxRate, amount: taxAmount },
        total,
        paymentMethod,
        paymentStatus,
        status: saleStatus,
        notes,
      };

      await saleAPI.create(payload);
      toast.success('Sale transaction recorded successfully!');
      setCart([]);
      setSelectedCustomerId('');
      setWalkInName('');
      setWalkInPhone('');
      setDiscountVal(0);
      setNotes('');
      setActiveTab('history');
      setHistoryPage(1);
      fetchSales();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete checkout');
    } finally {
      setSubmittingSale(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Sales Registry</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Record client sales and view generated tax invoices.</p>
        </div>
        <div className="flex bg-secondary p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'history' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sales History
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'new' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            New Sale (POS)
          </button>
        </div>
      </div>

      {/* Tab 1: Sales History */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-fade-in">
          {/* History Search */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative">
            <Search className="absolute left-7 top-7 w-4 h-4 text-muted-foreground" />
            <input
              value={searchHistory}
              onChange={e => { setSearchHistory(e.target.value); setHistoryPage(1); }}
              placeholder="Search by invoice number or client name..."
              className="form-input pl-9"
            />
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground text-sm">Loading sales history...</p>
              </div>
            ) : sales.length === 0 ? (
              <p className="text-center py-20 text-muted-foreground text-sm">No sales found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="p-4 table-header">Invoice</th>
                      <th className="p-4 table-header">Client</th>
                      <th className="p-4 table-header">Payment</th>
                      <th className="p-4 table-header">Status</th>
                      <th className="p-4 table-header">Total Amount</th>
                      <th className="p-4 table-header text-right">Invoice Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sales.map(s => {
                      const clientName = typeof s.customer === 'object' ? s.customer.name : (s.customerInfo?.name || 'Walk-in Customer');

                      return (
                        <tr key={s._id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4">
                            <p className="font-semibold text-foreground text-sm">{s.invoiceNumber}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</p>
                          </td>
                          <td className="p-4 text-sm text-foreground">{clientName}</td>
                          <td className="p-4">
                            <div className="text-xs text-foreground">
                              <span className="font-medium block">{s.paymentMethod}</span>
                              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                s.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-800'
                              }`}>{s.paymentStatus.toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`badge ${s.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-foreground">{formatCurrency(s.total, business?.currency)}</td>
                          <td className="p-4 text-right">
                            <Link to={`/sales/${s._id}`} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                              <Eye className="w-3.5 h-3.5" /> View Invoice
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* History Pagination */}
            {historyPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between text-sm">
                <button
                  onClick={() => setHistoryPage(p => Math.max(p - 1, 1))}
                  disabled={historyPage === 1}
                  className="btn-outline px-3 py-1"
                >
                  Previous
                </button>
                <span className="text-muted-foreground">Page {historyPage} of {historyPages}</span>
                <button
                  onClick={() => setHistoryPage(p => Math.min(p + 1, historyPages))}
                  disabled={historyPage === historyPages}
                  className="btn-outline px-3 py-1"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: New Sale POS */}
      {activeTab === 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
          {/* Products Finder (3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative">
              <Search className="absolute left-7 top-7 w-4 h-4 text-muted-foreground" />
              <input
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Find products to sell..."
                className="form-input pl-9"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(p => (
                <button
                  key={p._id}
                  onClick={() => addToCart(p)}
                  className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/50 transition-all flex flex-col justify-between hover:shadow-sm"
                >
                  <div>
                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider block">{p.sku}</span>
                    <h3 className="font-semibold text-sm text-foreground mt-0.5 line-clamp-1">{p.name}</h3>
                  </div>
                  <div className="mt-4 flex justify-between items-center w-full">
                    <span className="font-bold text-foreground text-sm">{formatCurrency(p.price.selling, business?.currency)}</span>
                    <span className={`text-[10px] font-bold ${p.stock.current <= p.stock.minimum ? 'text-amber-500' : 'text-muted-foreground'}`}>
                      Stock: {p.stock.current}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Checkout Cart Summary (2 columns) */}
          <div className="lg:col-span-2">
            <form onSubmit={handleCheckout} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between sticky top-20">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h2 className="font-bold text-foreground">Checkout Cart</h2>
                </div>

                {/* Customer Section */}
                <div className="space-y-3">
                  <div>
                    <label className="form-label text-xs">Customer</label>
                    <select
                      value={selectedCustomerId}
                      onChange={e => { setSelectedCustomerId(e.target.value); setWalkInName(''); }}
                      className="form-input text-xs"
                    >
                      <option value="">Walk-in Customer</option>
                      {customers.map(c => (
                        <option key={c._id} value={c._id}>{c.name} ({c.phone || 'No phone'})</option>
                      ))}
                    </select>
                  </div>

                  {!selectedCustomerId && (
                    <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-lg border border-border">
                      <div>
                        <label className="form-label text-[10px]">Customer Name</label>
                        <input
                          value={walkInName}
                          onChange={e => setWalkInName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="form-input text-xs py-1.5"
                        />
                      </div>
                      <div>
                        <label className="form-label text-[10px]">Phone Number</label>
                        <input
                          value={walkInPhone}
                          onChange={e => setWalkInPhone(e.target.value)}
                          placeholder="e.g. +92..."
                          className="form-input text-xs py-1.5"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Items */}
                <div className="max-h-48 overflow-y-auto divide-y divide-border">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground text-xs py-8">Your checkout cart is empty.</p>
                  ) : cart.map(item => (
                    <div key={item.product._id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-xs truncate">{item.product.name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatCurrency(item.unitPrice)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQuantity(item.product._id, -1)} className="p-1 rounded bg-secondary hover:bg-muted text-foreground">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.product._id, 1)} className="p-1 rounded bg-secondary hover:bg-muted text-foreground">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-foreground w-16 text-right">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                      <button type="button" onClick={() => removeFromCart(item.product._id)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <hr className="border-border" />

                {/* Payment & Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="form-input text-xs py-1.5"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Payment">Mobile Wallet</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-xs">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={e => setPaymentStatus(e.target.value as any)}
                      className="form-input text-xs py-1.5"
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="partial">Partial</option>
                    </select>
                  </div>
                </div>

                {/* Total Invoice Breakdown */}
                <div className="space-y-2 bg-muted/40 p-3.5 rounded-xl border border-border text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal, business?.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Discount:</span>
                    <input
                      type="number"
                      value={discountVal}
                      onChange={e => setDiscountVal(parseFloat(e.target.value) || 0)}
                      className="w-20 text-right bg-background border border-border rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST / Sales Tax ({taxRate}%):</span>
                    <span>{formatCurrency(taxAmount, business?.currency)}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between text-sm font-extrabold text-foreground">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(total, business?.currency)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingSale || cart.length === 0}
                className="btn-primary w-full py-2.5 text-xs"
              >
                {submittingSale ? 'Processing Checkout...' : 'Record Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
