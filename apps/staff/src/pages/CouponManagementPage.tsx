// ═══════════════════════════════════════════
// DineSmart — Coupon Management Page
// ═══════════════════════════════════════════

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Tag, Trash2, Plus, Percent, IndianRupee, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { getCoupons, createCoupon, deleteCoupon } from '../lib/api';

interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

export default function CouponManagementPage() {
  const queryClient = useQueryClient();
  const { restaurant } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENT',
    discountValue: '',
    minOrderValue: '0',
    maxUses: '100',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  const { data: coupons, isLoading } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: () => getCoupons() as Promise<Coupon[]>,
    refetchOnWindowFocus: true,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCoupon(formData);
      toast.success('Coupon created successfully');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setIsCreating(false);
      setFormData({
        code: '', discountType: 'PERCENT', discountValue: '', minOrderValue: '0', maxUses: '100',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      });
    } catch (err: any) {
      const message = err.details?.[0]?.message || err.message || 'Failed to create coupon';
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are You sure?')) return;
    try {
      await deleteCoupon(id);
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6 relative min-h-[400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Coupons & Offers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage discount codes for your customers</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors">
          <Plus size={16} /> New Coupon
        </button>
      </div>


      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Fetching your coupons...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(coupons || []).map((coupon) => (
            <div key={coupon.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500 shadow-inner">
                    <Tag size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                      {coupon.code}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {new Date(coupon.expiresAt) < new Date() ? (
                        <span className="text-[10px] font-black text-red-500 uppercase bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-500/20">Expired</span>
                      ) : coupon.isActive ? (
                        <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">Active</span>
                      ) : (
                        <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">Paused</span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(coupon.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all z-10">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-3 border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Reward</span>
                  <span className="font-black text-lg text-emerald-500">
                    {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                  </span>
                </div>
                
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Usage</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {coupon.usedCount} <span className="text-slate-400 font-medium">/ {coupon.maxUses}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Min. Order</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">₹{coupon.minOrderValue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 text-[11px] font-bold text-slate-400">
                   <Sparkles size={12} className="text-amber-500" />
                   EXPIRES {new Date(coupon.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                </div>
              </div>

              <button
                onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success('Code copied!'); }}
                className="w-full mt-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                Copy Coupon Code
              </button>
            </div>
          ))}
          {(!coupons || coupons.length === 0) && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-sm mb-4">
                <Gift size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No coupons created yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Boost your sales by creating promotional offers and discount codes for your customers.
              </p>
              <button onClick={() => setIsCreating(true)} className="mt-6 font-bold text-brand-500 hover:underline text-sm uppercase tracking-widest">
                Create first coupon
              </button>
            </div>
          )}
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create New Coupon</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Coupon Code</label>
                <input required type="text" placeholder="e.g. SUMMER20" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-mono uppercase focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Discount Type</label>
                  <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value as any })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-brand-500 outline-none">
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Value</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {formData.discountType === 'PERCENT' ? <Percent size={16} /> : <IndianRupee size={16} />}
                    </div>
                    <input required type="number" min="1" max={formData.discountType === 'PERCENT' ? 100 : undefined} value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-brand-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Min Order (₹)</label>
                  <input type="number" min="0" value={formData.minOrderValue} onChange={e => setFormData({ ...formData, minOrderValue: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Max Uses</label>
                  <input type="number" min="1" value={formData.maxUses} onChange={e => setFormData({ ...formData, maxUses: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-brand-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Expiry Date</label>
                <input required type="datetime-local" value={formData.expiresAt} onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-brand-500 outline-none" />
              </div>

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition-colors">
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
