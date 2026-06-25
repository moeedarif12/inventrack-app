import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, inventoryAPI } from '@/lib/api';
import type { Product, InventoryLog } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate, getStockStatusColor, getStockStatusLabel } from '@/lib/utils';
import { ArrowLeft, Package, TrendingUp, History, Plus, Minus, Settings, Barcode, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { business } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick stock action state
  const [stockAction, setStockAction] = useState<'in' | 'out' | 'adjust' | null>(null);
  const [qty, setQty] = useState('');
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingStock, setSubmittingStock] = useState(false);

  const fetchProductDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [prodRes, logsRes] = await Promise.all([
        productAPI.getOne(id),
        inventoryAPI.getLogs({ product: id }),
      ]);
      setProduct(prodRes.data.data);
      setLogs(logsRes.data.data);
    } catch {
      toast.error('Failed to load product details');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleStockActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !qty) return;
    const quantity = parseInt(qty);
    if (isNaN(quantity) || (stockAction !== 'adjust' && quantity <= 0)) {
      return toast.error('Please enter a valid quantity');
    }

    setSubmittingStock(true);
    try {
      if (stockAction === 'in') {
        await inventoryAPI.stockIn({ product: product._id, quantity, reference: ref, notes });
        toast.success('Stock added successfully');
      } else if (stockAction === 'out') {
        if (product.stock.current < quantity) {
          toast.error('Insufficient stock in inventory');
          setSubmittingStock(false);
          return;
        }
        await inventoryAPI.stockOut({ product: product._id, quantity, reference: ref, notes });
        toast.success('Stock removed successfully');
      } else if (stockAction === 'adjust') {
        await inventoryAPI.adjust({ product: product._id, newQuantity: quantity, notes });
        toast.success('Stock adjusted successfully');
      }

      setQty('');
      setRef('');
      setNotes('');
      setStockAction(null);
      // Reload details
      fetchProductDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSubmittingStock(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) return null;

  const categoryName = typeof product.category === 'object' ? product.category.name : 'Uncategorized';
  const categoryColor = typeof product.category === 'object' ? product.category.color : '#6366f1';

  return (
    <div className="space-y-6">
      {/* Header Back Link */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>
        <div className="flex items-center gap-3">
          <span className={`badge ${getStockStatusColor(product.stockStatus)}`}>
            {getStockStatusLabel(product.stockStatus)}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image + Info (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image box */}
              <div className="w-full md:w-48 h-48 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].startsWith('http') ? product.images[0] : `${import.meta.env.VITE_API_URL || ''}${product.images[0]}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                )}
              </div>

              {/* Main Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: categoryColor }} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{categoryName}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mt-1">{product.name}</h1>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">SKU: {product.sku.toUpperCase()}</p>
                </div>

                {product.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {product.tags.map((tag, idx) => (
                      <span key={idx} className="text-[11px] font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <hr className="border-border" />

            {/* Pricing / Details grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Buying Price</p>
                <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(product.price.buying, business?.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Selling Price</p>
                <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(product.price.selling, business?.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Profit Margin</p>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 mt-1">
                  <TrendingUp className="w-4 h-4" />
                  <p className="text-lg font-bold">{product.profitMargin}%</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Barcode / EAN</p>
                <div className="flex items-center gap-1.5 text-foreground mt-1">
                  <Barcode className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{product.barcode || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-primary" /> Log History
            </h3>
            <div className="overflow-x-auto">
              {logs.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">No inventory logs for this product</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="pb-3 font-semibold">Action</th>
                      <th className="pb-3 font-semibold">Qty Change</th>
                      <th className="pb-3 font-semibold">New Stock</th>
                      <th className="pb-3 font-semibold">Ref / Notes</th>
                      <th className="pb-3 font-semibold">Performed By</th>
                      <th className="pb-3 font-semibold text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {logs.map((log) => {
                      const logTypeLabels: Record<string, string> = {
                        stock_in: 'Stock In',
                        stock_out: 'Stock Out',
                        adjustment: 'Adjustment',
                        sale: 'Sale',
                        return: 'Return',
                        damage: 'Damage',
                        initial: 'Initial Stock',
                      };

                      const qtyColor = log.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

                      return (
                        <tr key={log._id} className="hover:bg-muted/5">
                          <td className="py-3 font-medium text-foreground">
                            {logTypeLabels[log.type] || log.type}
                          </td>
                          <td className={`py-3 font-semibold ${qtyColor}`}>
                            {log.quantity > 0 ? '+' : ''}{log.quantity}
                          </td>
                          <td className="py-3 text-foreground">{log.newStock}</td>
                          <td className="py-3 text-xs text-muted-foreground max-w-xs truncate">
                            {log.reference && <span className="font-semibold block">{log.reference}</span>}
                            <span>{log.notes || '-'}</span>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {typeof log.performedBy === 'object' ? log.performedBy.name : log.performedBy}
                          </td>
                          <td className="py-3 text-right text-xs text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Inventory Quick Actions (1/3 width) */}
        <div className="space-y-6">
          {/* Stock Summary Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground">Inventory Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-muted/40 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Current Stock</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1">{product.stock.current}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border p-3 rounded-xl text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unit</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{product.unit}</p>
                </div>
                <div className="border border-border p-3 rounded-xl text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Alert Threshold</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{product.stock.minimum}</p>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Quick Actions */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Adjust Inventory</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { setStockAction('in'); setQty(''); }}
                  className={`btn-outline text-xs px-2 py-2 flex flex-col items-center gap-1 ${stockAction === 'in' ? 'bg-primary/10 text-primary border-primary' : ''}`}
                >
                  <Plus className="w-4 h-4" /> Stock In
                </button>
                <button
                  onClick={() => { setStockAction('out'); setQty(''); }}
                  className={`btn-outline text-xs px-2 py-2 flex flex-col items-center gap-1 ${stockAction === 'out' ? 'bg-primary/10 text-primary border-primary' : ''}`}
                >
                  <Minus className="w-4 h-4" /> Stock Out
                </button>
                <button
                  onClick={() => { setStockAction('adjust'); setQty(String(product.stock.current)); }}
                  className={`btn-outline text-xs px-2 py-2 flex flex-col items-center gap-1 ${stockAction === 'adjust' ? 'bg-primary/10 text-primary border-primary' : ''}`}
                >
                  <Settings className="w-4 h-4" /> Adjust
                </button>
              </div>
            </div>

            {/* Form for actions */}
            {stockAction && (
              <form onSubmit={handleStockActionSubmit} className="space-y-3 pt-3 border-t border-border animate-fade-in">
                <h4 className="text-xs font-bold text-foreground capitalize">
                  {stockAction === 'in' ? 'Add Stock' : stockAction === 'out' ? 'Reduce Stock' : 'Set Stock Level'}
                </h4>
                <div>
                  <label className="form-label text-xs">
                    {stockAction === 'adjust' ? 'New Quantity' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                    placeholder="Enter value"
                    className="form-input text-xs py-2"
                    min={stockAction === 'adjust' ? '0' : '1'}
                    required
                  />
                </div>
                {stockAction !== 'adjust' && (
                  <div>
                    <label className="form-label text-xs">Reference (Optional)</label>
                    <input
                      value={ref}
                      onChange={e => setRef(e.target.value)}
                      placeholder="PO number, supplier invoice..."
                      className="form-input text-xs py-2"
                    />
                  </div>
                )}
                <div>
                  <label className="form-label text-xs">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Provide context..."
                    className="form-input text-xs py-2 resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStockAction(null)} className="btn-outline text-xs py-2 flex-1">Cancel</button>
                  <button type="submit" disabled={submittingStock} className="btn-primary text-xs py-2 flex-1">
                    {submittingStock ? 'Updating...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
