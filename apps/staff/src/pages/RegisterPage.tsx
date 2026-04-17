// ═══════════════════════════════════════════
// DineSmart — Restaurant Registration Page
// ═══════════════════════════════════════════

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UtensilsCrossed, Building2, Mail, Lock, User, ArrowRight } from 'lucide-react';

const API_URL = (import.meta as any).env.VITE_API_URL || '';
const API_BASE = `${API_URL}/api/v1`;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    restaurantName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: formData.restaurantName,
          email: formData.email,
          password: formData.password,
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Registration failed');
      
      toast.success('Restaurant created successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md mb-4 shadow-inner">
            <UtensilsCrossed size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Join DineSmart OS</h1>
          <p className="text-brand-100/80 text-sm">Create your restaurant workspace</p>
        </div>

        <form onSubmit={handleRegister} className="p-8">
          <div className="space-y-4 mb-8">
            <div className="relative">
              <Building2 size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formData.restaurantName}
                onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                placeholder="Restaurant Name"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Owner Email Address"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm Password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 hover:bg-brand-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Creating workspace...' : 'Register Restaurant'} <ArrowRight size={18} />
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-500 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
