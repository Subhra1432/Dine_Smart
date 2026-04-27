// ═══════════════════════════════════════════
// DineSmart — Staff Login Page
// ═══════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { login } from '../lib/api';
import toast from 'react-hot-toast';
import { UtensilsCrossed, Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'KITCHEN_STAFF') navigate('/kitchen');
      else if (user.role === 'CASHIER') navigate('/billing');
      else navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password) as {
        user: { id: string; email: string; role: string; restaurantId: string; branchId: string | null };
        restaurant: { id: string; name: string; slug: string; plan: string };
      };
      setAuth(
        { userId: result.user.id, email: result.user.email, role: result.user.role, restaurantId: result.user.restaurantId, branchId: result.user.branchId },
        result.restaurant
      );
      toast.success('Welcome back!');
      if (result.user.role === 'KITCHEN_STAFF') navigate('/kitchen');
      else if (result.user.role === 'CASHIER') navigate('/billing');
      else navigate('/admin');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest dark:bg-inverse-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <UtensilsCrossed size={32} className="text-on-surface dark:text-inverse-on-surface" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">DineSmart OS</h1>
          <p className="text-on-surface-variant dark:text-outline text-sm mt-1">Staff Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-2xl p-6 border border-outline-variant dark:border-outline shadow-xl">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant dark:text-outline mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-xl text-on-surface dark:text-inverse-on-surface border border-outline-variant focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant dark:text-outline mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-outline" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-xl text-on-surface dark:text-inverse-on-surface border border-outline-variant focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-primary to-primary-container text-on-surface dark:text-inverse-on-surface font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:from-primary-container hover:to-tertiary-container transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 bg-surface-container-lowest dark:bg-inverse-surface/30 rounded-xl p-4 border border-outline-variant dark:border-outline">
          <p className="text-xs text-on-surface-variant font-semibold mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-on-surface-variant">
            <p>Owner: owner@spicegarden.com / owner123</p>
            <p>Manager: manager@spicegarden.com / manager123</p>
            <p>Cashier: cashier@spicegarden.com / cashier123</p>
            <p>Kitchen: kitchen@spicegarden.com / kitchen123</p>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant dark:text-outline">
            New Restaurant?{' '}
            <a href="/register" className="text-primary font-semibold hover:text-primary hover:underline">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
