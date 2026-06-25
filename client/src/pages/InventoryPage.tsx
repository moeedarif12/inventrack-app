import React, { useEffect, useState, useCallback } from 'react';
import { inventoryAPI, productAPI, categoryAPI } from '@/lib/api';
import type { Product, InventoryLog, Category } from '@/types';
import { formatDate, getStockStatusColor, getStockStatusLabel } from '@/lib/utils';
import { Plus, Minus, Settings, AlertTriangle, Package, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'levels' | 'alerts' | 'history'>('levels');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for Stock Levels
  const [searchLevels, setSearchLevels] = useState('');
  const [catFilter, setCatFilter] = useState('');

  // Filters for History
  const [logType, setLogType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [logPages, setLogPages] = useState(1);

  // Quick Action Modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actionType, setActionType] = useState<'in' | 'out' | 'adjust'>('in');
  const [qty, setQty] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data.data);
    } catch {
      toast.error('Failed to load categories');
    }
  }, []);

  const fetchStockLevels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productAPI.getAll({
        search: searchLevels,
        category: catFilter || undefined,
        limit: 100, // Load all for stock tracking
      });
      setProducts(res.data.data);
    } catch {
      toast.error('Failed to load stock levels');
    } finally {
      setLoading(false);
    }
  }, [searchLevels, catFilter]);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await inventoryAPI.getLowStock();
      setLowStock(res.data.data);
    } catch {
      toast.error('Failed to load low stock alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await inventoryAPI.getLogs({
        page: logPage,
        limit: 15,
        type: logType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setLogs(res.data.data);
      if (res.data.pagination) {
        setLogPages(res.data.pagination.pages);
      }
    } catch {
      toast.error('Failed to load movement logs');
    } finally {
      setLoading(false);
    }
  }, [logPage, logType, startDate, endDate]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (activeTab === 'levels') {
      fetchStockLevels();
    } else if (activeTab === 'alerts') {
      fetchAlerts();
    } else if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, fetchStockLevels, fetchAlerts, fetchHistory]);

  const openAction = (p: Product, type: 'in' | 'out' | 'adjust') => {
    setSelectedProduct(p);
    setActionType(type);
    setQty(type === 'adjust' ? String(p.stock.current) : '');
    setReference('');
    setNotes('');
    setShowActionModal(true);
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !qty) return;
    const quantity = parseInt(qty);
    if (isNaN(quantity) || (actionType !== 'adjust' && quantity <= 0)) {
      return toast.error('Please enter a valid quantity');
    }

    setSubmittingAction(true);
    try {
      if (actionType === 'in') {
        await inventoryAPI.stockIn({ product: selectedProduct._id, quantity, reference, notes });
        toast.success('Stock added successfully');
      } else if (actionType === 'out') {
        if (selectedProduct.stock.current < quantity) {
          toast.error('Insufficient stock in inventory');
          setSubmittingAction(false);
          return;
        }
        await inventoryAPI.stockOut({ product: selectedProduct._id, quantity, reference, notes });
        toast.success('Stock removed successfully');
      } else if (actionType === 'adjust') {
        await inventoryAPI.adjust({ product: selectedProduct._id, newQuantity: quantity, notes });
        toast.success('Stock adjusted successfully');
      }

      setShowActionModal(false);
      // Refresh current tab
      if (activeTab === 'levels') fetchStockLevels();
      else if (activeTab === 'alerts') fetchAlerts();
      else fetchHistory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to perform stock action');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Control stock levels and view audit history.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border space-x-6">
        <button
          onClick={() => setActiveTab('levels')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'levels' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Stock Levels
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'alerts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Alerts
          {lowStock.length > 0 && (
            <span className="bg-amber-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
              {lowStock.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Movement History
        </button>
      </div>

      {/* Tab Contents: Stock Levels */}
      {activeTab === 'levels' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                value={searchLevels}
                onChange={e => setSearchLevels(e.target.value)}
                placeholder="Search by product name or SKU..."
                className="form-input pl-9"
              />
            </div>
            <div>
              <select
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                className="form-input"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground text-sm">Loading stock levels...</p>
              </div>
            ) : products.length === 0 ? (
              <p className="text-center py-20 text-muted-foreground text-sm">No products found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="p-4 table-header">Product</th>
                      <th className="p-4 table-header">SKU</th>
                      <th className="p-4 table-header">Status</th>
                      <th className="p-4 table-header">Current Stock</th>
                      <th className="p-4 table-header">Alert Threshold</th>
                      <th className="p-4 table-header text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map(p => (
                      <tr key={p._id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-foreground text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{typeof p.category === 'object' ? p.category.name : 'Uncategorized'}</p>
                        </td>
                        <td className="p-4 font-mono text-xs text-foreground uppercase">{p.sku}</td>
                        <td className="p-4">
                          <span className={`badge ${getStockStatusColor(p.stockStatus)}`}>
                            {getStockStatusLabel(p.stockStatus)}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-bold text-foreground">{p.stock.current} {p.unit}</td>
                        <td className="p-4 text-sm text-muted-foreground">{p.stock.minimum} {p.unit}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openAction(p, 'in')}
                              className="btn-outline px-2.5 py-1.5 text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                              title="Stock In"
                            >
                              <Plus className="w-3.5 h-3.5" /> In
                            </button>
                            <button
                              onClick={() => openAction(p, 'out')}
                              className="btn-outline px-2.5 py-1.5 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                              title="Stock Out"
                            >
                              <Minus className="w-3.5 h-3.5" /> Out
                            </button>
                            <button
                              onClick={() => openAction(p, 'adjust')}
                              className="btn-outline px-2.5 py-1.5 text-xs text-amber-500 hover:text-amber-600 flex items-center gap-1"
                              title="Adjust Stock"
                            >
                              <Settings className="w-3.5 h-3.5" /> Adjust
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Contents: Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {lowStock.length === 0 ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-6 rounded-xl flex items-center gap-3">
              <Package className="w-6 h-6 flex-shrink-0 text-emerald-500" />
              <div>
                <h3 className="font-semibold">All healthy!</h3>
                <p className="text-sm mt-0.5">No products are currently low on stock or out of stock.</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-semibold">Stock Warnings Detected</h3>
                <p className="text-sm mt-0.5">{lowStock.length} items require immediate replenishment to prevent supply chain disruption.</p>
              </div>
            </div>
          )}

          {lowStock.length > 0 && (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="p-4 table-header">Product</th>
                      <th className="p-4 table-header">SKU</th>
                      <th className="p-4 table-header">Status</th>
                      <th className="p-4 table-header">Current Stock</th>
                      <th className="p-4 table-header">Alert Threshold</th>
                      <th className="p-4 table-header text-right">Quick Stock In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lowStock.map(p => (
                      <tr key={p._id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-foreground text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{typeof p.category === 'object' ? p.category.name : 'Uncategorized'}</p>
                        </td>
                        <td className="p-4 font-mono text-xs text-foreground uppercase">{p.sku}</td>
                        <td className="p-4">
                          <span className={`badge ${p.stock.current === 0 ? 'badge-red' : 'badge-yellow'}`}>
                            {p.stock.current === 0 ? 'Out of Stock' : 'Low Stock'}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-bold text-red-500">{p.stock.current} {p.unit}</td>
                        <td className="p-4 text-sm text-muted-foreground">{p.stock.minimum} {p.unit}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => openAction(p, 'in')}
                            className="btn-primary py-1 px-3 text-xs"
                          >
                            Add Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: Movement History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card border border-border rounded-xl p-4 shadow-sm">
            <div>
              <label className="form-label text-xs">Movement Type</label>
              <select
                value={logType}
                onChange={e => { setLogType(e.target.value); setLogPage(1); }}
                className="form-input text-xs"
              >
                <option value="">All Movements</option>
                <option value="stock_in">Stock In</option>
                <option value="stock_out">Stock Out</option>
                <option value="adjustment">Adjustments</option>
                <option value="sale">Sales</option>
                <option value="return">Returns</option>
                <option value="damage">Damaged</option>
              </select>
            </div>
            <div>
              <label className="form-label text-xs">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); setLogPage(1); }}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label text-xs">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => { setEndDate(e.target.value); setLogPage(1); }}
                className="form-input text-xs"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setLogType(''); setStartDate(''); setEndDate(''); setLogPage(1); }}
                className="btn-outline w-full text-xs py-2.5"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground text-sm">Loading inventory logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <p className="text-center py-20 text-muted-foreground text-sm">No movements recorded</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 font-semibold text-xs text-muted-foreground">
                      <th className="p-4 table-header">Product</th>
                      <th className="p-4 table-header">Activity</th>
                      <th className="p-4 table-header">Quantity</th>
                      <th className="p-4 table-header">Closing Stock</th>
                      <th className="p-4 table-header">Ref / Notes</th>
                      <th className="p-4 table-header">Operator</th>
                      <th className="p-4 table-header text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {logs.map(log => {
                      const logTypeLabels: Record<string, string> = {
                        stock_in: 'Stock In',
                        stock_out: 'Stock Out',
                        adjustment: 'Adjustment',
                        sale: 'Sale',
                        return: 'Return',
                        damage: 'Damage',
                        initial: 'Initial Stock',
                      };

                      return (
                        <tr key={log._id} className="hover:bg-muted/5 transition-colors">
                          <td className="p-4">
                            <p className="font-semibold text-foreground text-sm">
                              {typeof log.product === 'object' ? log.product.name : 'Product'}
                            </p>
                            <p className="text-xs font-mono text-muted-foreground">
                              {typeof log.product === 'object' ? log.product.sku : ''}
                            </p>
                          </td>
                          <td className="p-4 font-medium text-foreground">
                            {logTypeLabels[log.type] || log.type}
                          </td>
                          <td className={`p-4 font-bold ${log.quantity > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {log.quantity > 0 ? '+' : ''}{log.quantity}
                          </td>
                          <td className="p-4 text-foreground">{log.newStock}</td>
                          <td className="p-4 text-xs text-muted-foreground max-w-xs truncate">
                            {log.reference && <span className="font-semibold block">{log.reference}</span>}
                            <span>{log.notes || '-'}</span>
                          </td>
                          <td className="p-4 text-muted-foreground text-xs">
                            {typeof log.performedBy === 'object' ? log.performedBy.name : log.performedBy}
                          </td>
                          <td className="p-4 text-right text-xs text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Logs pagination */}
            {logPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between text-sm bg-muted/10">
                <button
                  onClick={() => setLogPage(p => Math.max(p - 1, 1))}
                  disabled={logPage === 1}
                  className="btn-outline px-3 py-1"
                >
                  Previous
                </button>
                <span className="text-muted-foreground">Page {logPage} of {logPages}</span>
                <button
                  onClick={() => setLogPage(p => Math.min(p + 1, logPages))}
                  disabled={logPage === logPages}
                  className="btn-outline px-3 py-1"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showActionModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="mb-4">
              <h3 className="font-bold text-foreground text-lg capitalize">
                {actionType === 'in' ? 'Stock In' : actionType === 'out' ? 'Stock Out' : 'Adjust Stock'}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Product: {selectedProduct.name} (Current: {selectedProduct.stock.current} {selectedProduct.unit})</p>
            </div>
            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="form-label text-sm">
                  {actionType === 'adjust' ? `New Quantity (${selectedProduct.unit})` : `Quantity (${selectedProduct.unit}) *`}
                </label>
                <input
                  type="number"
                  value={qty}
                  onChange={e => setQty(e.target.value)}
                  placeholder="Enter number"
                  className="form-input"
                  min={actionType === 'adjust' ? '0' : '1'}
                  required
                />
              </div>

              {actionType !== 'adjust' && (
                <div>
                  <label className="form-label text-sm">Reference (Optional)</label>
                  <input
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    placeholder="e.g. PO-9192, INV-001"
                    className="form-input"
                  />
                </div>
              )}

              <div>
                <label className="form-label text-sm">Notes / Comments</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Provide context..."
                  className="form-input resize-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowActionModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={submittingAction} className="btn-primary flex-1">
                  {submittingAction ? 'Saving...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
