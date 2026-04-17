// ═══════════════════════════════════════════
// DineSmart — Superadmin Layout
// ═══════════════════════════════════════════

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Building2, CreditCard, Settings, LogOut, Menu, X, Bell } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '../components/ThemeToggle';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Overview' },
  { path: '/restaurants', icon: Building2, label: 'Restaurants' },
  { path: '/billing', icon: CreditCard, label: 'Billing & Plans' },
  { path: '/settings', icon: Settings, label: 'Platform Settings' },
];

export default function AdminLayout({ setIsLoggedIn }: { setIsLoggedIn: (v: boolean) => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Basic logout logic
    setIsLoggedIn(false);
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-slate-900 dark:text-white">DineSmart System</h1>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
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

          {/* User Info */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">admin@dinesmart.app</p>
                <p className="text-[10px] text-slate-500 font-medium">Root Access</p>
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
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
