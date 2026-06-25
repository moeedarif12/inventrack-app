import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '@/lib/api';
import type { DashboardStats, SalesChartData, Sale, InventoryLog } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import StatsCard from '@/components/dashboard/StatsCard';
import SalesChart from '@/components/dashboard/SalesChart';
import CategoryChart from '@/components/dashboard/CategoryChart';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import {
  Package, Users, ShoppingCart, DollarSign, AlertTriangle,
  XCircle, TrendingUp, Layers, ArrowRight, Activity
} from 'lucide-react';

export default function DashboardPage() {
  const { business, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesChart, setSalesChart] = useState<SalesChartData[]>([]);
  const [categoryChart, setCategoryChart] = useState([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [recentLogs, setRecentLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('30');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, salesRes, catRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getSalesChart({ period: chartPeriod }),
          dashboardAPI.getCategoryChart()
        ]);
        setStats(statsRes.data.data.stats);
        setRecentSales(statsRes.data.data.recentSales);
        setRecentLogs(statsRes.data.data.recentLogs);
        setSalesChart(salesRes.data.data);
        setCategoryChart(catRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [chartPeriod]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Products', value: stats?.totalProducts ?? 0, icon: Package, trend: 12, iconBg: 'bg-violet-500/10' },
    { title: 'Total Categories', value: stats?.totalCategories ?? 0, icon: Layers, iconBg: 'bg-indigo-500/10' },
    { title: 'Total Customers', value: stats?.totalCustomers ?? 0, icon: Users, trend: 8, iconBg: 'bg-cyan-500/10' },
    { title: 'Total Sales', value: stats?.totalSales ?? 0, icon: ShoppingCart, trend: 15, iconBg: 'bg-emerald-500/10' },
    { title: 'Monthly Revenue', value: formatCurrency(stats?.monthlyRevenue ?? 0, business?.currency), icon: DollarSign, trend: stats?.revenueGrowth, trendLabel: 'vs last month', iconBg: 'bg-amber-500/10' },
    { title: 'Inventory Value', value: formatCurrency(stats?.inventoryValue ?? 0, business?.currency), icon: TrendingUp, iconBg: 'bg-blue-500/10' },
    { title: 'Low Stock Items', value: stats?.lowStockProducts ?? 0, icon: AlertTriangle, iconBg: 'bg-amber-500/10' },
    { title: 'Out of Stock', value: stats?.outOfStockProducts ?? 0, icon: XCircle, iconBg: 'bg-red-500/10' },
  ];

  const logTypeColors: Record<string, string> = {
    stock_in: 'text-emerald-500',
    stock_out: 'text-red-500',
    adjustment: 'text-amber-500',
    sale: 'text-blue-500',
    initial: 'text-violet-500',
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Welcome back, {user?.name || 'User'}! 👋</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{business?.name} — Here's what's happening today.</p>
        </div>
        <Link to="/sales" className="btn-primary hidden md:inline-flex">
          New Sale <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales chart - 2/3 */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-foreground">Revenue Overview</h3>
              <p className="text-muted-foreground text-xs mt-0.5">Sales performance over time</p>
            </div>
            <select
              value={chartPeriod}
              onChange={e => setChartPeriod(e.target.value)}
              className="text-xs bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div className="h-56">
            <SalesChart data={salesChart} />
          </div>
        </div>

        {/* Category chart - 1/3 */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-5">
            <h3 className="font-semibold text-foreground">Category Breakdown</h3>
            <p className="text-muted-foreground text-xs mt-0.5">Revenue by category</p>
          </div>
          <div className="h-56">
            <CategoryChart data={categoryChart} />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Sales</h3>
            <Link to="/sales" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentSales.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No sales yet</p>
            ) : recentSales.map((sale) => (
              <Link to={`/sales/${sale._id}`} key={sale._id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0 hover:text-primary transition-colors">
                <div>
                  <p className="font-medium text-sm text-foreground">{sale.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {(sale.customer as any)?.name || sale.customerInfo?.name || 'Walk-in'} · {formatRelativeTime(sale.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-foreground">{formatCurrency(sale.total, business?.currency)}</p>
                  <span className={`text-xs ${sale.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{sale.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Inventory Activity
            </h3>
            <Link to="/inventory" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No activity yet</p>
            ) : recentLogs.map((log) => (
              <div key={log._id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${logTypeColors[log.type] || 'bg-muted'}`} style={{ background: 'currentColor' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{(log.product as any)?.name || 'Product'}</p>
                  <p className="text-xs text-muted-foreground">{log.type.replace('_', ' ')} · {formatRelativeTime(log.createdAt)}</p>
                </div>
                <span className={`text-sm font-medium flex-shrink-0 ${log.quantity > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {log.quantity > 0 ? '+' : ''}{log.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
