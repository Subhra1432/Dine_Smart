import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Ban, Play, Plus, X } from 'lucide-react';

const API = '/api/v1';
const fetchApi = async (url: string, opts?: RequestInit) => {
  const res = await fetch(`${API}${url}`, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || data.message || 'Error occurred');
  return data.data;
};

interface Restaurant { id: string; name: string; slug: string; plan: string; isActive: boolean; createdAt: string; monthlyRevenue: number; _count: { orders: number; branches: number } }

export default function RestaurantsPage() {
  const queryClient = useQueryClient();
  const { data: restaurants } = useQuery<{ items: Restaurant[] }>({ queryKey: ['saRestaurants'], queryFn: () => fetchApi('/superadmin/restaurants') });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRest, setNewRest] = useState({ name: '', slug: '', ownerEmail: '', ownerPassword: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/superadmin/restaurants', { method: 'POST', body: JSON.stringify(newRest) });
      toast.success('Restaurant created successfully!');
      setIsModalOpen(false);
      setNewRest({ name: '', slug: '', ownerEmail: '', ownerPassword: '' });
      queryClient.invalidateQueries({ queryKey: ['saRestaurants'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create restaurant');
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await fetchApi(`/superadmin/restaurants/${id}/suspend`, { method: 'PUT' });
      queryClient.invalidateQueries({ queryKey: ['saRestaurants'] });
      toast.success('Restaurant status updated');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handlePlanChange = async (id: string, plan: string) => {
    try {
      await fetchApi(`/superadmin/restaurants/${id}/plan`, { method: 'PUT', body: JSON.stringify({ plan }) });
      queryClient.invalidateQueries({ queryKey: ['saRestaurants'] });
      toast.success(`Plan updated to ${plan}`);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Restaurants Management</h1>
          <p className="text-sm text-slate-500 dark:text-brand-300/60 mt-1">Manage tenant plans and access</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600 transition-colors"
        >
          <Plus size={16} /> New Restaurant
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-200 dark:border-brand-500/10 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-brand-500/10">
          <h2 className="text-sm font-bold text-slate-700 dark:text-brand-300/60">ALL RESTAURANTS</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 dark:text-brand-300/40 border-b border-slate-200 dark:border-brand-500/10 bg-slate-50/50 dark:bg-transparent">
                <th className="text-left py-4 px-4">Restaurant</th>
                <th className="text-center py-4 px-4">Plan</th>
                <th className="text-center py-4 px-4">Branches</th>
                <th className="text-center py-4 px-4">Revenue (30d)</th>
                <th className="text-center py-4 px-4">Orders</th>
                <th className="text-center py-4 px-4">Status</th>
                <th className="text-center py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants?.items?.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 dark:border-brand-500/5 hover:bg-slate-50 dark:hover:bg-brand-500/5 transition-colors">
                  <td className="py-3 px-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{r.name}</p>
                    <p className="text-xs text-slate-500 dark:text-brand-300/40">{r.slug}</p>
                  </td>
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
                  <td className="py-3 px-4 text-sm font-semibold text-center text-slate-600 dark:text-brand-300/60">{r._count.branches}</td>
                  <td className="py-3 px-4 text-sm text-center text-emerald-600 dark:text-emerald-400 font-bold">₹{r.monthlyRevenue?.toLocaleString() || '0'}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-center text-slate-600 dark:text-brand-300/60">{r._count.orders}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      r.isActive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                    }`}>{r.isActive ? 'Active' : 'Suspended'}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleSuspend(r.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        r.isActive 
                          ? 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
                      }`}
                    >
                      {r.isActive ? <><Ban size={12} className="inline mr-1 mb-[1px]" />Suspend</> : <><Play size={12} className="inline mr-1 mb-[1px]" />Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-brand-500/20">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-brand-500/10">
              <h3 className="font-bold text-lg dark:text-white">Register New Restaurant</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Company Name</label>
                <input required value={newRest.name} onChange={e => setNewRest({...newRest, name: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Company Slug (URL)</label>
                <input required value={newRest.slug} onChange={e => setNewRest({...newRest, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Owner Email</label>
                <input type="email" required value={newRest.ownerEmail} onChange={e => setNewRest({...newRest, ownerEmail: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Owner Password</label>
                <input type="password" required value={newRest.ownerPassword} onChange={e => setNewRest({...newRest, ownerPassword: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 dark:text-white" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-brand-500 text-white font-bold rounded-lg mt-4 hover:bg-brand-600">
                Create Restaurant
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
