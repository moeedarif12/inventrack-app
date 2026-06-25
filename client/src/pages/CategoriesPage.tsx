import { useEffect, useState, useCallback } from 'react';
import { categoryAPI } from '@/lib/api';
import type { Category } from '@/types';
import { Plus, Edit2, Trash2, Tag, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
}

const defaultForm: CategoryFormData = { name: '', description: '', color: '#6366f1', icon: 'tag' };

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryAPI.getAll({ search });
      setCategories(res.data.data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (cat: Category) => { setForm({ name: cat.name, description: cat.description || '', color: cat.color, icon: cat.icon }); setEditId(cat._id); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await categoryAPI.update(editId, form);
        toast.success('Category updated!');
      } else {
        await categoryAPI.create(form);
        toast.success('Category created!');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoryAPI.delete(id);
      toast.success('Category deleted');
      setDeleteId(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cannot delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground text-sm">{categories.length} categories found</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="form-input pl-9"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No categories yet</p>
          <p className="text-muted-foreground text-sm mb-4">Create your first product category</p>
          <button onClick={openCreate} className="btn-primary">Add Category</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: cat.color + '20', border: `1px solid ${cat.color}30` }}>
                  <Tag className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(cat._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground text-sm">{cat.name}</h3>
              {cat.description && <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{cat.description}</p>}
              <div className="flex items-center gap-1 mt-3 text-muted-foreground text-xs">
                <Package className="w-3.5 h-3.5" />
                <span>{(cat as any).productCount ?? 0} products</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <h2 className="text-lg font-bold text-foreground mb-5">{editId ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" placeholder="Category name" />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input resize-none" rows={2} placeholder="Optional description" />
              </div>
              <div>
                <label className="form-label">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-card scale-110' : ''}`}
                      style={{ background: c, '--tw-ring-color': c } as React.CSSProperties}
                    />
                  ))}
                </div>
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

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <h2 className="text-lg font-bold text-foreground mb-2">Delete Category?</h2>
            <p className="text-muted-foreground text-sm mb-5">This action cannot be undone. Categories with products cannot be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-destructive flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
