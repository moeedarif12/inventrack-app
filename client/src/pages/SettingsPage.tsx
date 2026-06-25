import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { businessAPI, authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Settings, Lock, Building, FileText, Globe, User as UserIcon } from 'lucide-react';

const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR'];

export default function SettingsPage() {
  const { business, updateBusiness, user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'password'>('profile');

  // User profile state
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [submittingUser, setSubmittingUser] = useState(false);

  // Business profile state
  const [name, setName] = useState(business?.name || '');
  const [email, setEmail] = useState(business?.email || '');
  const [phone, setPhone] = useState(business?.phone || '');
  const [website, setWebsite] = useState(business?.website || '');
  const [description, setDescription] = useState(business?.description || '');
  const [currency, setCurrency] = useState(business?.currency || 'PKR');
  const [taxRate, setTaxRate] = useState(business?.taxRate || 0);
  const [lowStockThreshold, setLowStockThreshold] = useState(business?.lowStockThreshold || 10);
  const [invoicePrefix, setInvoicePrefix] = useState(business?.settings?.invoicePrefix || 'INV');
  const [skuPrefix, setSkuPrefix] = useState(business?.settings?.skuPrefix || 'SKU');
  const [allowNegativeStock, setAllowNegativeStock] = useState(business?.settings?.allowNegativeStock || false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(business?.logo || null);
  const [submittingProfile, setSubmittingProfile] = useState(false);

  // Security password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim()) return toast.error('Name is required');

    setSubmittingUser(true);
    try {
      const res = await authAPI.updateProfile({ name: ownerName });
      if (res.data.success) {
        updateUser(res.data.data.user);
        toast.success('Profile updated successfully');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Business name is required');
    if (!email.trim()) return toast.error('Business email is required');

    setSubmittingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('website', website);
      formData.append('description', description);
      formData.append('currency', currency);
      formData.append('taxRate', String(taxRate));
      formData.append('lowStockThreshold', String(lowStockThreshold));

      const settings = {
        invoicePrefix,
        skuPrefix,
        allowNegativeStock,
      };
      formData.append('settings', JSON.stringify(settings));

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await businessAPI.updateProfile(formData);
      if (res.data.success) {
        updateBusiness(res.data.data);
        toast.success('Business settings updated successfully');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update business profile');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error('All password fields are required');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }

    setSubmittingPassword(true);
    try {
      await authAPI.updatePassword({ currentPassword: oldPassword, newPassword });
      toast.success('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Control your profile preferences and business configurations.</p>
      </div>

      <div className="flex border-b border-border space-x-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserIcon className="w-4 h-4" /> My Profile
        </button>
        {user?.role !== 'admin' && (
          <button
            onClick={() => setActiveTab('business')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'business' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building className="w-4 h-4" /> Business Profile
          </button>
        )}
        <button
          onClick={() => setActiveTab('password')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'password' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lock className="w-4 h-4" /> Password & Security
        </button>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleUserSubmit} className="space-y-6 animate-fade-in bg-card border border-border rounded-2xl p-6 shadow-sm max-w-md">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-md">
              {ownerName ? ownerName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{user?.name}</h3>
              <p className="text-muted-foreground text-xs capitalize">{user?.role} Account</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Full Name *</label>
              <input 
                value={ownerName} 
                onChange={e => setOwnerName(e.target.value)} 
                className="form-input" 
                required 
              />
            </div>
            <div>
              <label className="form-label">Email Address (Read-only)</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                className="form-input bg-secondary cursor-not-allowed text-muted-foreground" 
                disabled 
                readOnly 
              />
            </div>
            <div>
              <label className="form-label">Account Role (Read-only)</label>
              <input 
                type="text" 
                value={user?.role || ''} 
                className="form-input bg-secondary cursor-not-allowed text-muted-foreground capitalize" 
                disabled 
                readOnly 
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 text-right">
            <button type="submit" disabled={submittingUser} className="btn-primary w-full">
              {submittingUser ? 'Saving profile changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'business' && user?.role !== 'admin' && (
        <form onSubmit={handleProfileSubmit} className="space-y-6 animate-fade-in bg-card border border-border rounded-2xl p-6 shadow-sm">
          {/* Logo upload row */}
          <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-border pb-6">
            <div className="w-20 h-20 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
              {logoPreview ? (
                <img src={logoPreview.startsWith('http') || logoPreview.startsWith('/uploads') ? (logoPreview.startsWith('http') ? logoPreview : `${import.meta.env.VITE_API_URL || ''}${logoPreview}`) : logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <label className="form-label text-sm">Business Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-xs text-muted-foreground file:mr-4 file:py-1.5 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2"><FileText className="w-4 h-4 text-primary" /> General Info</h3>
              <div>
                <label className="form-label">Business Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} className="form-input" required />
              </div>
              <div>
                <label className="form-label">Email Address *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Website URL</label>
                <input value={website} onChange={e => setWebsite(e.target.value)} className="form-input" placeholder="e.g. www.store.com" />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="form-input resize-none" rows={3} placeholder="Brief summary..." />
              </div>
            </div>

            {/* Financial and SKU Configurations */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2"><Globe className="w-4 h-4 text-primary" /> Preferences</h3>
              <div>
                <label className="form-label">Base Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="form-input">
                  {CURRENCIES.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Standard GST / Tax Rate (%)</label>
                <input type="number" min="0" max="100" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Low Stock Warning Threshold</label>
                <input type="number" min="0" value={lowStockThreshold} onChange={e => setLowStockThreshold(parseInt(e.target.value) || 0)} className="form-input" />
              </div>
              <div>
                <label className="form-label">SKU Auto-generation Prefix</label>
                <input value={skuPrefix} onChange={e => setSkuPrefix(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Invoice Number Prefix</label>
                <input value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} className="form-input" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">Allow Negative Stock Checkout</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Let sales continue even when items are out of stock.</p>
                </div>
                <input
                  type="checkbox"
                  checked={allowNegativeStock}
                  onChange={e => setAllowNegativeStock(e.target.checked)}
                  className="w-5 h-5 accent-primary border-border focus:ring-primary rounded"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 text-right">
            <button type="submit" disabled={submittingProfile} className="btn-primary">
              {submittingProfile ? 'Saving profile changes...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-fade-in bg-card border border-border rounded-2xl p-6 shadow-sm max-w-md">
          <h3 className="font-semibold text-foreground border-b border-border pb-2 mb-4">Change Password</h3>
          <div>
            <label className="form-label">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="pt-2 text-right">
            <button type="submit" disabled={submittingPassword} className="btn-primary w-full">
              {submittingPassword ? 'Updating password...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
