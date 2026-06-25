import { useEffect, useState, useCallback } from 'react';
import { reportAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { business } = useAuth();
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'customers'>('sales');
  const [loading, setLoading] = useState(true);

  // Sales report state
  const [salesSummary, setSalesSummary] = useState<any>({});
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('day');

  // Inventory report state
  const [invSummary, setInvSummary] = useState<any>({});
  const [invBreakdown, setInvBreakdown] = useState<any[]>([]);
  const [invProducts, setInvProducts] = useState<any[]>([]);

  // Customer report state
  const [custSummary, setCustSummary] = useState<any>({});
  const [topCustomers, setTopCustomers] = useState<any[]>([]);

  const fetchSalesReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getSales({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        groupBy,
      });
      setSalesSummary(res.data.data.summary || {});
      setSalesTrend(res.data.data.trend || []);
      setTopProducts(res.data.data.topProducts || []);
    } catch {
      toast.error('Failed to load sales report');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, groupBy]);

  const fetchInventoryReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getInventory();
      setInvSummary(res.data.data.summary || {});
      setInvBreakdown(res.data.data.categoryBreakdown || []);
      setInvProducts(res.data.data.products || []);
    } catch {
      toast.error('Failed to load inventory valuation report');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomerReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getCustomers();
      setCustSummary(res.data.data.summary || {});
      setTopCustomers(res.data.data.topCustomers || []);
    } catch {
      toast.error('Failed to load customer insights report');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesReport();
    } else if (activeTab === 'inventory') {
      fetchInventoryReport();
    } else if (activeTab === 'customers') {
      fetchCustomerReport();
    }
  }, [activeTab, fetchSalesReport, fetchInventoryReport, fetchCustomerReport]);

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Reports & Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Audit store finances, asset valuations, and customer behaviors.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border space-x-6">
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'sales' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Sales Performance
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'inventory' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Inventory Valuation
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'customers' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Customer CRM Insights
        </button>
      </div>

      {/* TABS CONTENT: SALES */}
      {activeTab === 'sales' && (
        <div className="space-y-6 animate-fade-in">
          {/* Query Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card border border-border rounded-xl p-4 shadow-sm">
            <div>
              <label className="form-label text-xs">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label text-xs">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label text-xs">Group By</label>
              <select
                value={groupBy}
                onChange={e => setGroupBy(e.target.value)}
                className="form-input text-xs"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setGroupBy('day'); }}
                className="btn-outline w-full text-xs py-2.5"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Generating sales figures...</p>
            </div>
          ) : (
            <>
              {/* Sales Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                  <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(salesSummary.totalRevenue || 0, business?.currency)}</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{salesSummary.totalOrders || 0} invoices</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs font-medium text-muted-foreground">Average Order Value</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(salesSummary.avgOrderValue || 0, business?.currency)}</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs font-medium text-muted-foreground">GST/Tax Collected</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(salesSummary.totalTax || 0, business?.currency)}</p>
                </div>
              </div>

              {/* Sales Chart */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4">Revenue Growth Trend</h3>
                <div className="h-64">
                  {salesTrend.length === 0 ? (
                    <p className="text-center text-muted-foreground text-xs py-20">No sales history found for the selected range</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesTrend}>
                        <defs>
                          <linearGradient id="salesRepGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="_id" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatCurrency(v)} />
                        <Tooltip formatter={(value: any) => [formatCurrency(value), 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#salesRepGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Top Products Table */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Top Performing Products</h3>
                </div>
                {topProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground text-xs py-8">No records available</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="p-4 table-header">Product Details</th>
                          <th className="p-4 table-header font-semibold">SKU</th>
                          <th className="p-4 table-header font-semibold">Quantity Sold</th>
                          <th className="p-4 table-header font-semibold">Total Revenue Generated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-sm">
                        {topProducts.map((p, idx) => (
                          <tr key={idx} className="hover:bg-muted/5 transition-colors">
                            <td className="p-4 font-semibold text-foreground">{p.name}</td>
                            <td className="p-4 font-mono text-xs text-foreground uppercase">{p.sku}</td>
                            <td className="p-4 text-foreground font-medium">{p.totalQty} units</td>
                            <td className="p-4 font-bold text-foreground">{formatCurrency(p.totalRevenue, business?.currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* TABS CONTENT: INVENTORY VALUATION */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Performing valuation audits...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                  <p className="text-xs font-medium text-muted-foreground">Total Asset Value (Cost)</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(invSummary.totalValue || 0, business?.currency)}</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs font-medium text-muted-foreground">Active SKUs</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{invSummary.totalProducts || 0} items</p>
                </div>
                <div className="stat-card flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Low Stock Warnings</p>
                    <p className="text-2xl font-bold text-amber-500 mt-1">{invSummary.lowStock || 0}</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                </div>
                <div className="stat-card flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">{invSummary.outOfStock || 0}</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                </div>
              </div>

              {/* Layout for chart and breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Pie */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm lg:col-span-2">
                  <h3 className="font-semibold text-foreground mb-4">Valuation by Category</h3>
                  <div className="h-64 flex flex-col md:flex-row items-center justify-around gap-6">
                    <div className="w-full md:w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={invBreakdown}
                            dataKey="totalValue"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={3}
                          >
                            {invBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="space-y-2 w-full md:w-1/2 overflow-y-auto max-h-56 pr-2">
                      {invBreakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs border-b border-border pb-1 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color || COLORS[idx % COLORS.length] }} />
                            <span className="text-foreground truncate max-w-[120px]">{item.name}</span>
                          </div>
                          <span className="font-bold text-foreground">{formatCurrency(item.totalValue, business?.currency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category breakdown table */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold text-foreground mb-4">Stock Breakdown</h3>
                  <div className="space-y-4">
                    {invBreakdown.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-foreground font-semibold">{item.name}</span>
                          <span className="text-muted-foreground">{item.totalStock} units</span>
                        </div>
                        <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              background: item.color || COLORS[idx % COLORS.length],
                              width: `${Math.min(100, (item.totalValue / (invSummary.totalValue || 1)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Valuation Inventory table */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Stock Asset Listing</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="p-4 table-header">Product Details</th>
                        <th className="p-4 table-header font-semibold">SKU</th>
                        <th className="p-4 table-header font-semibold">Cost Price</th>
                        <th className="p-4 table-header font-semibold">Available Stock</th>
                        <th className="p-4 table-header font-semibold">Asset Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {invProducts.map((p, idx) => (
                        <tr key={idx} className="hover:bg-muted/5 transition-colors">
                          <td className="p-4">
                            <span className="font-semibold text-foreground block">{p.name}</span>
                            <span className="text-xs text-muted-foreground">{typeof p.category === 'object' ? p.category.name : 'Uncategorized'}</span>
                          </td>
                          <td className="p-4 font-mono text-xs text-foreground uppercase">{p.sku}</td>
                          <td className="p-4 text-foreground">{formatCurrency(p.price.buying)}</td>
                          <td className="p-4 text-foreground font-medium">{p.stock.current}</td>
                          <td className="p-4 text-foreground font-bold">{formatCurrency(p.price.buying * p.stock.current, business?.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TABS CONTENT: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-6 animate-fade-in">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Analyzing sales and customers behavior...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="stat-card">
                  <p className="text-xs font-medium text-muted-foreground">Total Customer Profiles</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{custSummary.total || 0} clients</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs font-medium text-muted-foreground">Total Customer Spend</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(custSummary.totalSpent || 0, business?.currency)}</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs font-medium text-muted-foreground">Average Client Lifetime Value</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(custSummary.avgSpent || 0, business?.currency)}</p>
                </div>
              </div>

              {/* Top Customers Table */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Top Valued Customers</h3>
                </div>
                {topCustomers.length === 0 ? (
                  <p className="text-center text-muted-foreground text-xs py-8">No client purchase data available yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="p-4 table-header">Customer Profile</th>
                          <th className="p-4 table-header font-semibold">Contact Info</th>
                          <th className="p-4 table-header font-semibold">Invoices Generated</th>
                          <th className="p-4 table-header font-semibold">Total Revenue Contributed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-sm">
                        {topCustomers.map((c, idx) => (
                          <tr key={idx} className="hover:bg-muted/5 transition-colors">
                            <td className="p-4 font-semibold text-foreground">{c.name}</td>
                            <td className="p-4 text-xs text-muted-foreground">
                              {c.phone && <p>Phone: {c.phone}</p>}
                              {c.email && <p>Email: {c.email}</p>}
                            </td>
                            <td className="p-4 text-foreground">{c.totalPurchases} orders</td>
                            <td className="p-4 font-bold text-foreground">{formatCurrency(c.totalSpent, business?.currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
