// ═══════════════════════════════════════════
// DineSmart — Dashboard Layout (Sidebar)
// ═══════════════════════════════════════════

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { logout } from '../lib/api';
import {
  LayoutDashboard, Receipt, ChefHat, UtensilsCrossed, BarChart3,
  Package, Settings, LogOut, Menu, X, CreditCard, Tag, MessageSquare,
  Mail, Phone, MessageCircle, Lock
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '../components/ThemeToggle';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Overview', roles: ['OWNER', 'MANAGER'] },
  { path: '/billing', icon: Receipt, label: 'Billing', roles: ['OWNER', 'MANAGER', 'CASHIER'] },
  { path: '/kitchen', icon: ChefHat, label: 'Kitchen', roles: ['OWNER', 'MANAGER', 'KITCHEN_STAFF'] },
  { path: '/admin/menu', icon: UtensilsCrossed, label: 'Menu', roles: ['OWNER', 'MANAGER'] },
  { path: '/admin/coupons', icon: Tag, label: 'Coupons', roles: ['OWNER', 'MANAGER'] },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', roles: ['OWNER'] },
  { path: '/admin/feedback', icon: MessageSquare, label: 'Feedback', roles: ['OWNER', 'MANAGER'] },
  { path: '/admin/inventory', icon: Package, label: 'Inventory', roles: ['OWNER', 'MANAGER'] },
  { path: '/admin/subscription', icon: CreditCard, label: 'Subscription', roles: ['OWNER', 'MANAGER'] },
  { path: '/admin/settings', icon: Settings, label: 'Settings', roles: ['OWNER', 'MANAGER'] },
];

export default function DashboardLayout() {
  const { user, restaurant, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    clearAuth();
    toast.success('Logged out');
    navigate('/login');
  };

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md flex items-center justify-center">
                <UtensilsCrossed size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-slate-900 dark:text-white">DineSmart OS</h1>
                <p className="text-xs text-slate-500">{restaurant?.name}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                       ? 'bg-brand-500/10 text-brand-600 border border-brand-200 dark:bg-brand-500/15 dark:text-brand-400 dark:border-brand-500/20 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Support Section */}
          <div className="mx-3 mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Help & Support</h3>
            <div className="space-y-2">
              <a href="mailto:support@dinesmart.ai" className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-500 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                  <Mail size={14} />
                </div>
                Email Support
              </a>
              
              {restaurant?.plan === 'GROWTH' || restaurant?.plan === 'PREMIUM' ? (
                <a href="https://wa.me/919937000000" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shadow-sm border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <MessageCircle size={14} />
                  </div>
                  WhatsApp Chat
                </a>
              ) : (
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 cursor-not-allowed opacity-60">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <MessageCircle size={14} />
                  </div>
                  WhatsApp <Lock size={10} className="ml-auto" />
                </div>
              )}

              {restaurant?.plan === 'PREMIUM' ? (
                <a href="tel:+919937000000" className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-500 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center shadow-sm border border-brand-100 dark:border-brand-500/20 text-brand-600 dark:text-brand-400">
                    <Phone size={14} />
                  </div>
                  24/7 Priority Call
                </a>
              ) : (
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 cursor-not-allowed opacity-60">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <Phone size={14} />
                  </div>
                  Call Support <Lock size={10} className="ml-auto" />
                </div>
              )}
            </div>
            
            {restaurant?.plan === 'STARTER' && (
              <NavLink to="/admin/subscription" className="mt-4 block text-center py-2 bg-brand-500 text-white text-[10px] font-black rounded-lg hover:bg-brand-600 transition-all shadow-md shadow-brand-500/20">
                UPGRADE FOR PRIORITY
              </NavLink>
            )}
          </div>

          {/* User Info */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold">
                {user?.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
                <p className="text-[10px] text-slate-500 font-medium">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1 text-slate-600 dark:text-slate-300">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <ThemeToggle />
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
