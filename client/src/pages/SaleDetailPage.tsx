import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saleAPI } from '@/lib/api';
import type { Sale, Business } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Printer, ShoppingBag, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [businessInfo, setBusinessInfo] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSaleDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await saleAPI.getOne(id);
      setSale(res.data.data.sale);
      setBusinessInfo(res.data.data.business);
    } catch {
      toast.error('Failed to load invoice details');
      navigate('/sales');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchSaleDetails();
  }, [fetchSaleDetails]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading invoice...</p>
      </div>
    );
  }

  if (!sale || !businessInfo) return null;

  const clientName = typeof sale.customer === 'object' ? sale.customer.name : (sale.customerInfo?.name || 'Walk-in Customer');
  const clientEmail = typeof sale.customer === 'object' ? sale.customer.email : (sale.customerInfo?.email || '');
  const clientPhone = typeof sale.customer === 'object' ? sale.customer.phone : (sale.customerInfo?.phone || '');
  const clientAddress = typeof sale.customer === 'object' ? sale.customer.address : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto printable-area">
      {/* Header and Print Actions (Hidden in Print Mode) */}
      <div className="flex items-center justify-between no-print">
        <button onClick={() => navigate('/sales')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Registry
        </button>
        <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
          <Printer className="w-4 h-4" /> Print Invoice
        </button>
      </div>

      {/* Invoice Card */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8 print:border-0 print:shadow-none">
        {/* Invoice Top Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-foreground tracking-wider uppercase">{businessInfo.name}</span>
            </div>
            {businessInfo.address && (
              <div className="text-xs text-muted-foreground mt-3 space-y-1">
                <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 flex-shrink-0" /> {businessInfo.address.street}, {businessInfo.address.city}, {businessInfo.address.country}</p>
                {businessInfo.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 flex-shrink-0" /> {businessInfo.phone}</p>}
                {businessInfo.email && <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 flex-shrink-0" /> {businessInfo.email}</p>}
              </div>
            )}
          </div>

          <div className="text-left md:text-right space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Tax Invoice
            </span>
            <h1 className="text-xl font-bold text-foreground pt-2">{sale.invoiceNumber}</h1>
            <p className="text-xs text-muted-foreground">Date: {formatDate(sale.createdAt)}</p>
            <p className="text-xs text-muted-foreground">Payment: <span className="font-bold text-foreground">{sale.paymentMethod}</span></p>
          </div>
        </div>

        <hr className="border-border" />

        {/* Invoice Client / Bill-to details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Billed To</p>
            <p className="font-bold text-foreground text-sm">{clientName}</p>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              {clientPhone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {clientPhone}</p>}
              {clientEmail && <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {clientEmail}</p>}
              {clientAddress && (
                <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {clientAddress.street}, {clientAddress.city}</p>
              )}
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Billing Agent</p>
            <p className="text-sm font-semibold text-foreground">{typeof sale.soldBy === 'object' ? sale.soldBy.name : 'System Owner'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{typeof sale.soldBy === 'object' ? sale.soldBy.email : ''}</p>
            <div className="mt-3 flex md:justify-end gap-1.5">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                sale.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-800'
              }`}>{sale.paymentStatus.toUpperCase()}</span>
              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-bold capitalize">
                {sale.status}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground uppercase font-bold">
                <th className="p-4">Item Details</th>
                <th className="p-4 text-center">Qty</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-right">Discount</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {sale.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/5 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{item.sku || 'N/A'}</p>
                  </td>
                  <td className="p-4 text-center text-foreground font-medium">{item.quantity}</td>
                  <td className="p-4 text-right text-foreground">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-4 text-right text-muted-foreground">-{item.discount}%</td>
                  <td className="p-4 text-right text-foreground font-bold">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Calculations summary */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-4">
          <div className="flex-1 text-xs text-muted-foreground">
            {sale.notes && (
              <div className="bg-muted/20 p-4 border border-border rounded-xl max-w-md">
                <p className="font-bold text-foreground uppercase tracking-wider text-[10px] mb-1.5">Invoice Notes</p>
                <p className="leading-relaxed">{sale.notes}</p>
              </div>
            )}
          </div>

          <div className="w-full md:w-80 space-y-2.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-medium text-foreground">{formatCurrency(sale.subtotal, businessInfo.currency)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount:</span>
                <span>-{formatCurrency(sale.discount, businessInfo.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>GST / Sales Tax ({sale.tax?.rate || 0}%):</span>
              <span className="font-medium text-foreground">{formatCurrency(sale.tax?.amount || 0, businessInfo.currency)}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between text-base font-extrabold text-foreground">
              <span>Invoice Total:</span>
              <span className="text-primary">{formatCurrency(sale.total, businessInfo.currency)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p className="flex items-center justify-center gap-1.5 font-medium text-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Thank you for your business!
          </p>
          <p className="mt-1">Computer generated invoice. Requires no signature.</p>
        </div>
      </div>
    </div>
  );
}
