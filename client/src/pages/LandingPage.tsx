import { Link } from 'react-router-dom';
import {
  Package, Users, ShoppingCart, BarChart3, Shield, Zap,
  ArrowRight, CheckCircle, Layers, Star
} from 'lucide-react';

const features = [
  { icon: Package, title: 'Smart Inventory', desc: 'Real-time stock tracking with auto low-stock alerts and intelligent reorder points.', color: 'from-violet-500 to-indigo-600' },
  { icon: ShoppingCart, title: 'Sales Management', desc: 'Create sales, generate invoices automatically, and track revenue with ease.', color: 'from-cyan-500 to-blue-600' },
  { icon: Users, title: 'Customer CRM', desc: 'Manage customer profiles, purchase history, and build lasting relationships.', color: 'from-emerald-500 to-teal-600' },
  { icon: BarChart3, title: 'Advanced Analytics', desc: 'Beautiful charts and reports to understand your business performance.', color: 'from-orange-500 to-rose-600' },
  { icon: Shield, title: 'Multi-Business', desc: 'Each business gets their own secure, isolated dashboard and data.', color: 'from-pink-500 to-rose-600' },
  { icon: Zap, title: 'Instant Setup', desc: 'Register your business and start managing inventory in minutes.', color: 'from-amber-500 to-orange-600' },
];

const stats = [
  { value: '10K+', label: 'Products Tracked' },
  { value: '500+', label: 'Businesses' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">InvenTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-white transition-colors">Stats</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login?admin=true" className="hidden sm:flex text-sm text-amber-500/90 hover:text-amber-400 transition-colors px-3 py-1.5 items-center gap-1.5 font-medium border border-amber-500/20 rounded-lg bg-amber-500/10">
              <Shield className="w-3.5 h-3.5" />
              Admin Login
            </Link>
            <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link to="/signup" className="text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg transition-all duration-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm mb-8">
            <Star className="w-3.5 h-3.5" />
            <span>Modern SaaS Inventory Platform</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6">
            Manage Your
            <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Business Inventory
            </span>
            Like a Pro
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            A powerful multi-business platform to manage products, customers, sales, and inventory with real-time analytics and beautiful dashboards.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25">
              Start Free Today
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/10 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-200">
              Sign In
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-white/40">
            {['No credit card required', 'Free to get started', 'Cancel anytime'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Run Your Business</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              From inventory to invoices, InvenTrack gives you all the tools to manage and grow your business efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 hover:border-white/10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-white/50 mb-8 max-w-lg mx-auto">
                Join hundreds of businesses already using InvenTrack to streamline their operations.
              </p>
              <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30">
                Create Your Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/30 text-sm">
        <p>© 2024 InvenTrack. Built with ❤️ for modern businesses.</p>
      </footer>
    </div>
  );
}
