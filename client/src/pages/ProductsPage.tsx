import React, { useEffect, useState, useCallback } from 'react';
import { productAPI, categoryAPI } from '@/lib/api';
import type { Product, Category } from '@/types';
import { formatCurrency, getStockStatusColor, getProductImageUrl } from '@/lib/utils';
import { Plus, Edit, Trash2, Search, Package, Image as ImageIcon, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: { buying: number; selling: number };
  stock: { current: number; minimum: number };
  unit: string;
  barcode: string;
  tags: string[];
}

const defaultForm: ProductFormData = {
  name: '',
  description: '',
  category: '',
  price: { buying: 0, selling: 0 },
  stock: { current: 0, minimum: 10 },
  unit: 'pcs',
  barcode: '',
  tags: [],
};

const UNITS = ['pcs', 'kg', 'g', 'ltr', 'ml', 'box', 'pack', 'dozen', 'set', 'pair', 'roll', 'm', 'ft'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(defaultForm);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data.data);
    } catch {
      toast.error('Failed to load categories');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productAPI.getAll({
        page,
        limit: 10,
        search,
        category: categoryFilter || undefined,
        stockStatus: stockFilter || undefined,
      });
      setProducts(res.data.data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.pages);
      }
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, stockFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);

      const previews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const removeSelectedImage = async (index: number) => {
    const previewUrl = imagePreviews[index];
    if (editId && !previewUrl.startsWith('blob:')) {
      try {
        await productAPI.deleteImage(editId, previewUrl);
        toast.success('Image removed from server');
      } catch {
        toast.error('Failed to remove image');
        return;
      }
    } else {
      const existingCount = imagePreviews.filter(p => !p.startsWith('blob:')).length;
      const newFileIndex = index - existingCount;
      if (newFileIndex >= 0) {
        setImages(prev => prev.filter((_, i) => i !== newFileIndex));
      }
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const openCreate = () => {
    setForm(defaultForm);
    setEditId(null);
    setImages([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description || '',
      category: typeof p.category === 'object' ? p.category._id : p.category,
      price: { buying: p.price.buying, selling: p.price.selling },
      stock: { current: p.stock.current, minimum: p.stock.minimum },
      unit: p.unit,
      barcode: p.barcode || '',
      tags: p.tags || [],
    });
    setEditId(p._id);
    setImages([]);
    // Setup existing server-side image previews
    setImagePreviews(p.images || []);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Product name is required');
    if (!form.category) return toast.error('Category is required');
    if (form.price.buying < 0 || form.price.selling < 0) return toast.error('Prices cannot be negative');

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('price', JSON.stringify(form.price));
      formData.append('stock', JSON.stringify(form.stock));
      formData.append('unit', form.unit);
      formData.append('barcode', form.barcode);
      formData.append('tags', JSON.stringify(form.tags));

      // Append new files
      images.forEach(image => {
        formData.append('images', image);
      });

      if (editId) {
        await productAPI.update(editId, formData);
        toast.success('Product updated successfully');
      } else {
        await productAPI.create(formData);
        toast.success('Product created successfully');
      }

      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productAPI.delete(deleteId);
      toast.success('Product deleted successfully');
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage items in your inventory.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products by name, SKU, barcode..."
            className="form-input pl-9"
          />
        </div>
        <div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="form-input"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value)}
            className="form-input"
          >
            <option value="">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No products found</p>
              <p className="text-muted-foreground text-sm mt-0.5">Try adjusting your filters or create a new product.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 table-header">Product</th>
                  <th className="p-4 table-header">SKU</th>
                  <th className="p-4 table-header">Category</th>
                  <th className="p-4 table-header">Prices</th>
                  <th className="p-4 table-header">Margin</th>
                  <th className="p-4 table-header">Stock</th>
                  <th className="p-4 table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map(p => {
                  const categoryName = typeof p.category === 'object' ? p.category.name : 'Uncategorized';
                  const categoryColor = typeof p.category === 'object' ? p.category.color : '#6366f1';
                  const mainImage = p.images && p.images.length > 0 ? p.images[0] : null;

                  return (
                    <tr key={p._id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                          {mainImage ? (
                            <img src={getProductImageUrl(mainImage)} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.unit}</p>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-foreground uppercase">{p.sku}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: categoryColor }} />
                          <span className="text-sm text-foreground">{categoryName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-muted-foreground">
                          <div>Buy: <span className="font-medium text-foreground">{formatCurrency(p.price.buying)}</span></div>
                          <div>Sell: <span className="font-medium text-foreground">{formatCurrency(p.price.selling)}</span></div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-foreground">
                        {p.profitMargin}%
                      </td>
                      <td className="p-4">
                        <div>
                          <span className={`badge ${getStockStatusColor(p.stockStatus)}`}>
                            {p.stock.current} {p.unit}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Min: {p.stock.minimum}</p>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/products/${p._id}`} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground" title="View details">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(p._id)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-red-500" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-foreground mb-5">{editId ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="form-label">Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="form-input"
                    placeholder="Product name"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="form-input"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Unit</label>
                  <select
                    value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="form-input text-foreground bg-background"
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Buying Price *</label>
                  <input
                    type="number"
                    value={form.price.buying}
                    onChange={e => setForm(f => ({ ...f, price: { ...f.price, buying: parseFloat(e.target.value) || 0 } }))}
                    className="form-input"
                    placeholder="Buying price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Selling Price *</label>
                  <input
                    type="number"
                    value={form.price.selling}
                    onChange={e => setForm(f => ({ ...f, price: { ...f.price, selling: parseFloat(e.target.value) || 0 } }))}
                    className="form-input"
                    placeholder="Selling price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Current Stock</label>
                  <input
                    type="number"
                    value={form.stock.current}
                    onChange={e => setForm(f => ({ ...f, stock: { ...f.stock, current: parseInt(e.target.value) || 0 } }))}
                    className="form-input"
                    placeholder="Current quantity"
                    min="0"
                    disabled={!!editId} // Inventory page is used for adjustment of existing items
                  />
                </div>
                <div>
                  <label className="form-label">Minimum Stock Alert</label>
                  <input
                    type="number"
                    value={form.stock.minimum}
                    onChange={e => setForm(f => ({ ...f, stock: { ...f.stock, minimum: parseInt(e.target.value) || 0 } }))}
                    className="form-input"
                    placeholder="Min alert stock"
                    min="0"
                  />
                </div>
                <div>
                  <label className="form-label">Barcode / SKU Prefix</label>
                  <input
                    value={form.barcode}
                    onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
                    className="form-input"
                    placeholder="EAN, UPC, or custom"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="form-input resize-none"
                  rows={2}
                  placeholder="Product description (optional)"
                />
              </div>

              {/* Product Image uploads */}
              <div>
                <label className="form-label">Product Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                <div className="flex gap-2 flex-wrap mt-3">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg border border-border overflow-hidden">
                      <img src={preview.startsWith('blob:') ? preview : getProductImageUrl(preview)} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(i)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5 hover:bg-red-600"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
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

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <h3 className="font-bold text-foreground text-lg mb-2">Delete Product</h3>
            <p className="text-muted-foreground text-sm mb-6">Are you sure? This action cannot be undone. Product will be deactivated.</p>
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
