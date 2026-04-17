// ═══════════════════════════════════════════
// DineSmart — Analytics Page
// ═══════════════════════════════════════════

import { useQuery } from '@tanstack/react-query';
import { getMenuPerformance, getPeakHours, getTablePerformance, getRevenue, getDemandForecast, getPricingSuggestions } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Crown, Lock, Sparkles, BrainCircuit, ArrowUpRight, IndianRupee, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/auth';

interface MenuPerf { bestSellers: Array<{ name: string; orderCount: number; revenue: number }>; slowMoving: Array<{ name: string; orderCount: number; revenue: number }> }
interface PeakHour { hour: number; dayOfWeek: number; orderCount: number }
interface TablePerf { tableNumber: number; totalOrders: number; avgRevenue: number; totalRevenue: number; avgSessionMinutes: number }
interface RevenueData { dataPoints: Array<{ date: string; revenue: number; orders: number }>; summary: { totalRevenue: number; totalOrders: number; avgOrderValue: number } }
interface DemandForecast { menuItemId: string; name: string; expectedOrders: number; isHighDemand: boolean }
interface PricingSuggestion { menuItemId: string; name: string; currentPrice: number; suggestedPrice: number; reason: string }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AnalyticsPage() {
  const { restaurant } = useAuthStore();
  
  // Distribute AI features across plans
  const plan = restaurant?.plan || 'STARTER';
  const hasProAnalytics = plan !== 'STARTER';
  const hasDemandForecast = plan === 'GROWTH' || plan === 'PREMIUM';
  const hasSmartPricing = plan === 'PREMIUM';

  const { data: menuPerf } = useQuery<MenuPerf>({ queryKey: ['menuPerformance'], queryFn: () => getMenuPerformance() as Promise<MenuPerf>, enabled: hasProAnalytics });
  const { data: peakHours } = useQuery<PeakHour[]>({ queryKey: ['peakHours'], queryFn: () => getPeakHours() as Promise<PeakHour[]>, enabled: hasProAnalytics });
  const { data: tablePerf } = useQuery<TablePerf[]>({ queryKey: ['tablePerformance'], queryFn: () => getTablePerformance() as Promise<TablePerf[]>, enabled: hasProAnalytics });
  const { data: revenue } = useQuery<RevenueData>({ queryKey: ['revenueAnalytics'], queryFn: () => getRevenue() as Promise<RevenueData> });
  
  const { data: demandForecast } = useQuery<DemandForecast[]>({ 
    queryKey: ['demandForecast'], 
    queryFn: () => getDemandForecast() as Promise<DemandForecast[]>,
    enabled: hasDemandForecast 
  });
  
  const { data: pricingSuggestions } = useQuery<PricingSuggestion[]>({ 
    queryKey: ['pricingSuggestions'], 
    queryFn: () => getPricingSuggestions() as Promise<PricingSuggestion[]>,
    enabled: hasSmartPricing 
  });

  // Transform peak hours into a simpler format
  const peakHoursByHour = peakHours?.reduce<Record<number, number>>((acc, p) => {
    acc[p.hour] = (acc[p.hour] || 0) + p.orderCount;
    return acc;
  }, {});

  const hourlyData = peakHoursByHour ? Object.entries(peakHoursByHour).map(([hour, count]) => ({
    hour: `${hour}:00`,
    orders: count,
  })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour)) : [];

  return (
    <div className="space-y-6 relative">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>

      {!hasProAnalytics && (
        <div className="absolute inset-x-0 bottom-0 top-32 z-10 flex flex-col items-center pt-32 bg-slate-50/60 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] max-w-md text-center transform hover:scale-[1.01] transition-transform">
                <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-amber-300 shadow-xl shadow-amber-500/20">
                    <Crown size={40} className="text-white drop-shadow-lg" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Unlock AI Insights</h2>
                <p className="text-base text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Gain access to AI Demand Forecasting, Smart Pricing Suggestions, and deep performance metrics. Start making data-driven decisions today.</p>
                <a href="/admin/subscription" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 active:scale-95 uppercase tracking-wider">
                   <Sparkles size={18} /> Upgrade Plan
                </a>
            </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Revenue (30d)</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-black text-slate-900 dark:text-white">₹{(revenue?.summary.totalRevenue || 0).toLocaleString()}</p>
            <TrendingUp size={24} className="text-emerald-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Orders (30d)</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-black text-slate-900 dark:text-white">{revenue?.summary.totalOrders || 0}</p>
            <TrendingUp size={24} className="text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Order Value</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-black text-slate-900 dark:text-white">₹{(revenue?.summary.avgOrderValue || 0).toFixed(0)}</p>
            <IndianRupee size={24} className="text-brand-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* AI Smart Insights Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Demand Forecast */}
        <div className={`col-span-2 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-900 rounded-[32px] p-8 border border-indigo-100 dark:border-indigo-500/20 relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-indigo-500/10 group ${!hasDemandForecast && 'opacity-70 grayscale'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BrainCircuit size={80} className="text-indigo-500" />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Next 3-Hour Forecast</h2>
              <p className="text-xs font-bold text-indigo-500/60 uppercase tracking-widest">AI Prediction Engine</p>
            </div>
          </div>

          {!hasDemandForecast ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-center">
              <Lock size={32} className="text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-400">Unlocked on Growth Plan</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
               {demandForecast?.slice(0, 3).map((item, idx) => (
                 <div key={idx} className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-500/10 shadow-sm">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1">High Probability</p>
                    <h4 className="font-black text-slate-900 dark:text-white truncate">{item.name}</h4>
                    <div className="flex items-end justify-between mt-3">
                       <span className="text-2xl font-black text-slate-900 dark:text-white">~{item.expectedOrders}</span>
                       <span className="text-xs font-bold text-slate-500">Orders expected</span>
                    </div>
                 </div>
               ))}
               {(!demandForecast || demandForecast.length === 0) && (
                 <div className="col-span-3 text-center py-10 text-slate-400">Collecting training data for today's snapshot...</div>
               )}
            </div>
          )}
        </div>

        {/* Smart Pricing Suggestions */}
        <div className={`bg-gradient-to-br from-brand-50 to-white dark:from-brand-950/20 dark:to-slate-900 rounded-[32px] p-8 border border-brand-100 dark:border-brand-500/10 relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-brand-500/10 group ${!hasSmartPricing && 'opacity-70 grayscale'}`}>
           <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white">
              <ArrowUpRight size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Smart Pricing</h2>
              <p className="text-xs font-bold text-emerald-500/60 uppercase tracking-widest">Revenue Optimizer</p>
            </div>
          </div>

          {!hasSmartPricing ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-center">
              <Crown size={32} className="text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">PREMIUM Feature</p>
              <a href="/admin/subscription" className="mt-4 text-[10px] font-black text-brand-500 underline">LEARN MORE</a>
            </div>
          ) : (
            <div className="space-y-4">
              {pricingSuggestions?.slice(0, 2).map((s, idx) => (
                <div key={idx} className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-emerald-500/10">
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate max-w-[120px]">{s.name}</span>
                     <span className="text-[10px] font-black text-emerald-500">-₹{(s.currentPrice - s.suggestedPrice).toFixed(0)}</span>
                   </div>
                   <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-slate-400 line-through">₹{s.currentPrice}</span>
                      <ArrowUpRight size={12} className="text-emerald-500" />
                      <span className="text-lg font-black text-emerald-500">₹{s.suggestedPrice}</span>
                   </div>
                   <p className="text-[10px] text-slate-500 leading-tight italic">"{s.reason.split('.')[0]}."</p>
                </div>
              ))}
              {(!pricingSuggestions || pricingSuggestions.length === 0) && (
                 <div className="text-center py-10 text-slate-400 italic text-[10px]">Your menu pricing is already peak-optimized.</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 10 Best Sellers */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" /> TOP 10 BEST SELLERS
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={menuPerf?.bestSellers || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={120} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
              <Bar dataKey="orderCount" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Slow Moving Items */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <TrendingDown size={14} className="text-red-400" /> SLOW MOVING ITEMS
          </h2>
          <div className="space-y-3">
            {menuPerf?.slowMoving?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.orderCount} orders • ₹{item.revenue.toFixed(0)} revenue</p>
                </div>
                <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">Low demand</span>
              </div>
            ))}
            {(!menuPerf?.slowMoving || menuPerf.slowMoving.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-8">No slow moving items</p>
            )}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">PEAK HOURS</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
              <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table Performance */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">TABLE PERFORMANCE</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2">Table</th>
                  <th className="text-center py-2">Orders</th>
                  <th className="text-center py-2">Revenue</th>
                  <th className="text-center py-2">Avg/Order</th>
                  <th className="text-center py-2">Avg Session</th>
                </tr>
              </thead>
              <tbody>
                {tablePerf?.map((t) => (
                  <tr key={t.tableNumber} className="border-b border-slate-200 dark:border-slate-700/30">
                    <td className="py-2 font-medium">#{t.tableNumber}</td>
                    <td className="py-2 text-center text-slate-500 dark:text-slate-400">{t.totalOrders}</td>
                    <td className="py-2 text-center">₹{t.totalRevenue.toLocaleString()}</td>
                    <td className="py-2 text-center text-slate-500 dark:text-slate-400">₹{t.avgRevenue}</td>
                    <td className="py-2 text-center text-slate-500">{t.avgSessionMinutes}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
