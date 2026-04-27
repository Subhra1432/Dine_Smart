import { useState } from 'react';
import toast from 'react-hot-toast';
import { Shield, LogIn } from 'lucide-react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { ThemeToggle } from './components/ThemeToggle';
import AdminLayout from './layouts/AdminLayout';
import OverviewPage from './pages/OverviewPage';
import RestaurantsPage from './pages/RestaurantsPage';
import BillingPlansPage from './pages/BillingPlansPage';
import PlatformSettingsPage from './pages/PlatformSettingsPage';

const API = '/api/v1';
const fetchApi = async (url: string, opts?: RequestInit) => {
  const res = await fetch(`${API}${url}`, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/auth/superadmin/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      setIsLoggedIn(true);
      toast.success('Welcome, Super Admin!');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Login failed'); }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface-container-low to-surface-container-high dark:from-inverse-surface dark:to-inverse-surface dark:bg-inverse-surface">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-surface-container-lowest dark:bg-inverse-surface p-6 rounded-2xl shadow-xl border border-outline-variant dark:border-primary/20">
          <div className="text-center mb-6">
            <Shield size={40} className="text-primary dark:text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-on-surface dark:text-inverse-on-surface">Super Admin</h1>
            <p className="text-sm text-on-surface-variant dark:text-primary/60">DineSmart Platform Control</p>
          </div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
            className="w-full mb-3 px-4 py-3 bg-surface-container-low dark:bg-inverse-surface rounded-xl text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required
            className="w-full mb-4 px-4 py-3 bg-surface-container-low dark:bg-inverse-surface rounded-xl text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
          <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
            <LogIn size={16} /> Sign In
          </button>
          <p className="text-xs text-on-surface-variant dark:text-primary/40 text-center mt-4">admin@dinesmart.ai / superadmin123</p>
        </form>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<AdminLayout setIsLoggedIn={setIsLoggedIn} />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/billing" element={<BillingPlansPage />} />
        <Route path="/settings" element={<PlatformSettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
