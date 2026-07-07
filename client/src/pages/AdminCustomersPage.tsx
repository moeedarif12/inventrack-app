import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Building2, Edit, Trash2, X, Save } from "lucide-react";
import toast from "react-hot-toast";

interface SystemUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  business?: { name: string };
}

const ROLES = ["owner", "admin", "staff"];

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editRole, setEditRole] = useState("owner");
  const [saving, setSaving] = useState(false);
  const { token, user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/customers");
      setUsers(res.data.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users. Are you logged in as admin?");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [token]);

  const openEdit = (u: SystemUser) => {
    setEditingUser(u);
    setEditRole(u.role);
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await api.put(`/admin/users/${editingUser._id}/role`, { role: editRole });
      toast.success("User role updated");
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === (currentUser as any)?._id) {
      toast.error("You cannot delete your own account");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
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
        <h2 className="text-3xl font-bold tracking-tight">System Users</h2>
        <p className="text-muted-foreground mt-1">View and manage all registered user accounts.</p>
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
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Business</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === "admin" ? "bg-violet-500/10 text-violet-500" :
                        u.role === "staff" ? "bg-blue-500/10 text-blue-500" :
                        "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        {u.business ? u.business.name : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(u)} className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit Role">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(u._id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Edit User Role</h3>
              <button onClick={() => setEditingUser(null)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium">{editingUser.name}</p>
                <p className="text-xs text-muted-foreground">{editingUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Role</label>
                <select value={editRole} onChange={e => setEditRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border rounded-lg hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSaveRole} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
