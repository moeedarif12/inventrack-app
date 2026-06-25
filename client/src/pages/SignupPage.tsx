import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layers, Mail, Lock, User, Building2, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    businessName: '', businessEmail: '', phone: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user: any = await register(form);
      if (user?.role === 'admin') {
        navigate('/admin/businesses');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderField = ({ label, icon: Icon, field, type = 'text', placeholder }: any) => (
    <div key={field}>
      <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type={type === 'password' ? (showPass ? 'text' : 'password') : type}
          value={form[field as keyof typeof form]}
          onChange={handleChange(field)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 placeholder:text-white/20 transition-all"
        />
        {type === 'password' && (
          <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">InvenTrack</span>
        </Link>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Create Your Business Account</h1>
          <p className="text-white/40 text-sm">Set up your business and start managing inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          {/* Owner info */}
          <div className="pb-3 border-b border-white/5">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">Owner Information</p>
            <div className="grid grid-cols-1 gap-3">
              {renderField({ label: "Full Name", icon: User, field: "name", placeholder: "Your full name" })}
              {renderField({ label: "Email Address", icon: Mail, field: "email", type: "email", placeholder: "you@example.com" })}
              {renderField({ label: "Password", icon: Lock, field: "password", type: "password", placeholder: "Min. 6 characters" })}
              {renderField({ label: "Confirm Password", icon: Lock, field: "confirmPassword", type: "password", placeholder: "Repeat password" })}
            </div>
          </div>

          {/* Business info */}
          <div>
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">Business Information</p>
            <div className="grid grid-cols-1 gap-3">
              {renderField({ label: "Business Name", icon: Building2, field: "businessName", placeholder: "Your Business Name" })}
              {renderField({ label: "Business Email", icon: Mail, field: "businessEmail", type: "email", placeholder: "business@example.com" })}
              {renderField({ label: "Phone (Optional)", icon: Phone, field: "phone", placeholder: "+92 300 0000000" })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Create Account <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
