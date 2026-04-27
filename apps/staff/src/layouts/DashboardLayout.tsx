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
    <div className="flex h-screen bg-surface dark:bg-inverse-surface transition-colors">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-container-lowest dark:bg-on-surface border-r border-outline-variant/50 dark:border-inverse-on-surface/10 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="p-5 border-b border-outline-variant/50 dark:border-inverse-on-surface/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container shadow-md flex items-center justify-center">
                <UtensilsCrossed size={20} className="text-on-primary" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-on-surface dark:text-inverse-on-surface">DineSmart OS</h1>
                <p className="text-xs text-on-surface-variant/70 dark:text-inverse-on-surface/70">{restaurant?.name}</p>
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
                       ? 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-inverse-primary dark:border-primary/30 shadow-sm'
                      : 'text-on-surface-variant/70 dark:text-inverse-on-surface/70 hover:text-on-surface hover:bg-surface-container dark:hover:text-inverse-on-surface dark:hover:bg-inverse-on-surface/10'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Support Section */}
          <div className="mx-3 mb-4 p-4 rounded-2xl bg-surface dark:bg-inverse-surface border border-outline-variant/50 dark:border-inverse-on-surface/10">
            <h3 className="text-[10px] font-bold text-on-surface-variant/50 dark:text-inverse-on-surface/50 uppercase tracking-widest mb-3">Help & Support</h3>
            <div className="space-y-2">
              <a href="mailto:support@dinesmart.ai" className="flex items-center gap-3 text-xs font-semibold text-on-surface-variant dark:text-inverse-on-surface/70 hover:text-primary transition-colors">
                <div className="w-7 h-7 rounded-lg bg-surface-container-lowest dark:bg-inverse-on-surface/10 flex items-center justify-center shadow-sm border border-outline-variant/30 dark:border-inverse-on-surface/10">
                  <Mail size={14} />
                </div>
                Email Support
              </a>
              
              {restaurant?.plan === 'GROWTH' || restaurant?.plan === 'PREMIUM' ? (
                <a href="https://wa.me/919937000000" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-xs font-semibold text-on-surface-variant dark:text-inverse-on-surface/70 hover:text-green-500 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 dark:bg-green-500/10 flex items-center justify-center shadow-sm border border-green-500/20 text-green-600 dark:text-green-400">
                    <MessageCircle size={14} />
                  </div>
                  WhatsApp Chat
                </a>
              ) : (
                <div className="flex items-center gap-3 text-xs font-semibold text-on-surface-variant/50 cursor-not-allowed opacity-60">
                  <div className="w-7 h-7 rounded-lg bg-surface-container dark:bg-inverse-on-surface/5 flex items-center justify-center border border-outline-variant/30 dark:border-inverse-on-surface/10">
                    <MessageCircle size={14} />
                  </div>
                  WhatsApp <Lock size={10} className="ml-auto" />
                </div>
              )}

              {restaurant?.plan === 'PREMIUM' ? (
                <a href="tel:+919937000000" className="flex items-center gap-3 text-xs font-semibold text-on-surface-variant dark:text-inverse-on-surface/70 hover:text-primary transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/10 flex items-center justify-center shadow-sm border border-primary/20 text-primary dark:text-inverse-primary">
                    <Phone size={14} />
                  </div>
                  24/7 Priority Call
                </a>
              ) : (
                <div className="flex items-center gap-3 text-xs font-semibold text-on-surface-variant/50 cursor-not-allowed opacity-60">
                  <div className="w-7 h-7 rounded-lg bg-surface-container dark:bg-inverse-on-surface/5 flex items-center justify-center border border-outline-variant/30 dark:border-inverse-on-surface/10">
                    <Phone size={14} />
                  </div>
                  Call Support <Lock size={10} className="ml-auto" />
                </div>
              )}
            </div>
            
            {restaurant?.plan === 'STARTER' && (
              <NavLink to="/admin/subscription" className="mt-4 block text-center py-2 bg-primary text-on-primary text-[10px] font-black rounded-lg hover:bg-primary-container transition-all shadow-md shadow-primary/20">
                UPGRADE FOR PRIORITY
              </NavLink>
            )}
          </div>

          {/* User Info */}
          <div className="p-3 border-t border-outline-variant/50 dark:border-inverse-on-surface/10">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-inverse-primary text-xs font-bold">
                {user?.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface dark:text-inverse-on-surface truncate">{user?.email}</p>
                <p className="text-[10px] text-on-surface-variant/70 font-medium">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-surface-container dark:hover:bg-inverse-on-surface/10 text-on-surface-variant/50 hover:text-error dark:hover:text-error-container transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-outline-variant/50 dark:border-inverse-on-surface/10 flex items-center px-4 gap-4 bg-surface-container-lowest/80 dark:bg-inverse-surface/80 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1 text-on-surface-variant dark:text-inverse-on-surface/70">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <ThemeToggle />
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-surface dark:bg-inverse-surface">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
