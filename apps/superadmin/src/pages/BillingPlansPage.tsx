// ═══════════════════════════════════════════
// DineSmart — Super Admin Billing & Plans Page
// ═══════════════════════════════════════════

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CreditCard, IndianRupee, TrendingUp, Building2 } from 'lucide-react';

const API = '/api/v1';
const fetchApi = async (url: string, opts?: RequestInit) => {
  const res = await fetch(`${API}${url}`, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  createdAt: string;
  monthlyRevenue: number;
  _count: { orders: number; branches: number };
}

const PLANS = [
  { name: 'STARTER', price: 999, features: ['1 Branch', '10 Tables', 'Basic Analytics', 'Email Support'] },
  { name: 'GROWTH', price: 2499, features: ['3 Branches', '50 Tables', 'Full Analytics', 'AI Features', 'Priority Support'] },
  { name: 'PREMIUM', price: 7499, features: ['Unlimited Branches', 'Unlimited Tables', 'Full Analytics', 'AI Features', 'White Label', '24/7 Support'] },
];

export default function BillingPlansPage() {
  const queryClient = useQueryClient();
  const { data: restaurants } = useQuery<{ items: Restaurant[] }>({
    queryKey: ['saRestaurants'],
    queryFn: () => fetchApi('/superadmin/restaurants'),
  });

  const handlePlanChange = async (id: string, plan: string) => {
    try {
      await fetchApi(`/superadmin/restaurants/${id}/plan`, { method: 'PUT', body: JSON.stringify({ plan }) });
      queryClient.invalidateQueries({ queryKey: ['saRestaurants'] });
      toast.success(`Plan updated to ${plan}`);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const planCounts = PLANS.map(p => ({
    ...p,
    count: restaurants?.items?.filter(r => r.plan === p.name).length || 0,
  }));

  const totalMRR = planCounts.reduce((sum, p) => sum + p.price * p.count, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Plans</h1>
        <p className="text-sm text-slate-500 dark:text-brand-300/60 mt-1">Manage subscription plans and revenue</p>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-brand-500/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <IndianRupee size={20} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{totalMRR.toLocaleString()}</p>
          <p className="text-xs text-slate-500 dark:text-brand-300/50">Monthly Recurring Revenue</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-brand-500/10">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
            <Building2 size={20} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{restaurants?.items?.length || 0}</p>
          <p className="text-xs text-slate-500 dark:text-brand-300/50">Total Subscribers</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-brand-500/10">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3">
            <TrendingUp size={20} className="text-brand-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{(totalMRR * 12).toLocaleString()}</p>
          <p className="text-xs text-slate-500 dark:text-brand-300/50">Projected ARR</p>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {planCounts.map((plan) => (
          <div key={plan.name} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-brand-500/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-400">{plan.count} tenants</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-4">₹{plan.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="text-xs text-slate-500 dark:text-brand-300/50 flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Restaurant Plan Assignments */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-brand-500/10 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-brand-500/10">
          <h2 className="text-sm font-bold text-slate-700 dark:text-brand-300/60">SUBSCRIPTION ASSIGNMENTS</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 dark:text-brand-300/40 border-b border-slate-200 dark:border-brand-500/10">
                <th className="text-left py-3 px-4">Restaurant</th>
                <th className="text-center py-3 px-4">Current Plan</th>
                <th className="text-center py-3 px-4">MRR Contribution</th>
                <th className="text-center py-3 px-4">Change Plan</th>
              </tr>
            </thead>
            <tbody>
              {restaurants?.items?.map((r) => {
                const planPrice = PLANS.find(p => p.name === r.plan)?.price || 0;
                return (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-brand-500/5 hover:bg-slate-50 dark:hover:bg-brand-500/5">
                    <td className="py-3 px-4">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{r.name}</p>
                      <p className="text-xs text-slate-500 dark:text-brand-300/40">{r.slug}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400">{r.plan}</span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm font-bold text-emerald-400">₹{planPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={r.plan}
                        onChange={(e) => handlePlanChange(r.id, e.target.value)}
                        className="bg-slate-100 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-white rounded-lg px-2 py-1.5 border border-slate-200 dark:border-brand-500/20 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="STARTER">Starter</option>
                        <option value="GROWTH">Growth</option>
                        <option value="PREMIUM">Premium</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
