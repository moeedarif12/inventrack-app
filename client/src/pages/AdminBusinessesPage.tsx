import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, AlertCircle, Edit, Trash2, X, Save } from "lucide-react";
import toast from "react-hot-toast";

interface Business {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  owner?: { name: string; email: string };
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();

  const fetchBusinesses = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/businesses");
      setBusinesses(res.data.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch businesses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBusinesses(); }, [token]);

  const openEdit = (b: Business) => {
    setEditingBusiness(b);
    setEditForm({ name: b.name, email: b.email, phone: b.phone || "", isActive: b.isActive !== false });
  };

  const handleSave = async () => {
    if (!editingBusiness) return;
    setSaving(true);
    try {
      await api.put(`/admin/businesses/${editingBusiness._id}`, editForm);
      toast.success("Business updated successfully");
      setEditingBusiness(null);
      fetchBusinesses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update business");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this business? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/businesses/${id}`);
      toast.success("Business deleted");
      fetchBusinesses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete business");
    }
  };

  if (isLoading) return (
    <div className="p-8 flex justify-center">
      <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Businesses</h2>
        <p className="text-muted-foreground mt-1">Manage all registered businesses on the platform.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div><h3 className="font-semibold">Error</h3><p className="text-sm opacity-90">{error}</p></div>
        </div>
      )}

      {!error && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Business Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Owner</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {businesses.map((b) => (
                  <tr key={b._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        {b.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">{b.email}</td>
                    <td className="px-6 py-4">{b.owner ? b.owner.name : "No Owner"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${b.isActive !== false ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {b.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(b)} className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(b._id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {businesses.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No businesses found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Edit Business</h3>
              <button onClick={() => setEditingBusiness(null)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Business Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <input type="text" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Status</label>
                <select value={editForm.isActive ? "active" : "inactive"} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.value === "active" }))}
                  className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setEditingBusiness(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border rounded-lg hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
