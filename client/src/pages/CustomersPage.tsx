import React, { useEffect, useState, useCallback } from 'react';
import { customerAPI } from '@/lib/api';
import type { Customer } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Edit, Trash2, Search, User, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  notes: string;
}

const defaultForm: CustomerFormData = {
  name: '',
  email: '',
  phone: '',
  address: { street: '', city: '', state: '', country: 'Pakistan' },
  notes: '',
};

export default function CustomersPage() {
  const { business } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerFormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customerAPI.getAll({ page, limit: 10, search });
      setCustomers(res.data.data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.pages);
      }
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openCreate = () => {
    setForm(defaultForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setForm({
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      address: {
        street: c.address?.street || '',
        city: c.address?.city || '',
        state: c.address?.state || '',
        country: c.address?.country || 'Pakistan',
      },
      notes: c.notes || '',
    });
    setEditId(c._id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Customer name is required');

    setSubmitting(true);
    try {
      if (editId) {
        await customerAPI.update(editId, form);
        toast.success('Customer updated successfully');
      } else {
        await customerAPI.create(form);
        toast.success('Customer created successfully');
      }

      setShowModal(false);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await customerAPI.delete(deleteId);
      toast.success('Customer deleted successfully');
      setDeleteId(null);
      fetchCustomers();
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage customer directory and buying behavior.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative">
        <Search className="absolute left-7 top-7 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search customers by name, email, or phone..."
          className="form-input pl-9"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No customers found</p>
              <p className="text-muted-foreground text-sm mt-0.5">Try adjusting your search terms or add a new customer.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 table-header">Name</th>
                  <th className="p-4 table-header">Contact Info</th>
                  <th className="p-4 table-header">Location</th>
                  <th className="p-4 table-header">Total Orders</th>
                  <th className="p-4 table-header">Total Spent</th>
                  <th className="p-4 table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map(c => (
                  <tr key={c._id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">Joined: {formatDate(c.createdAt)}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground">
                      <div className="space-y-1">
                        {c.phone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="w-3 h-3" /> {c.phone}</div>}
                        {c.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="w-3 h-3" /> {c.email}</div>}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground max-w-xs truncate">
                      {c.address?.street || c.address?.city ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{c.address.street}{c.address.street && ', '}{c.address.city}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-sm text-foreground">{c.totalPurchases} orders</td>
                    <td className="p-4 text-sm font-bold text-foreground">{formatCurrency(c.totalSpent, business?.currency)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-red-500" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-sm">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="btn-outline px-3 py-1"
            >
              Previous
            </button>
            <span className="text-muted-foreground">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="btn-outline px-3 py-1"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-foreground mb-5">{editId ? 'Edit Customer' : 'New Customer'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="form-input"
                  placeholder="Customer name"
                  required
                />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="form-input"
                  placeholder="Email address"
                />
              </div>

              <div>
                <label className="form-label">Phone</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="form-input"
                  placeholder="Phone number"
                />
              </div>

              <div className="border-t border-border pt-4 mt-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Address</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="form-label text-xs">Street</label>
                    <input
                      value={form.address.street}
                      onChange={e => setForm(f => ({ ...f, address: { ...f.address, street: e.target.value } }))}
                      className="form-input text-xs py-2"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">City</label>
                    <input
                      value={form.address.city}
                      onChange={e => setForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))}
                      className="form-input text-xs py-2"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">State</label>
                    <input
                      value={form.address.state}
                      onChange={e => setForm(f => ({ ...f, address: { ...f.address, state: e.target.value } }))}
                      className="form-input text-xs py-2"
                      placeholder="State"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="form-input resize-none"
                  rows={2}
                  placeholder="Special instructions or customer details..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editId ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <h3 className="font-bold text-foreground text-lg mb-2">Delete Customer</h3>
            <p className="text-muted-foreground text-sm mb-6">Are you sure? Customer record will be deactivated.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleDelete} className="btn-destructive flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
