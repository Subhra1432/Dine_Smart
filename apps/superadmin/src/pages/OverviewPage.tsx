import { useQuery } from '@tanstack/react-query';
import { IndianRupee, Building2, TrendingUp, ShoppingBag, Users, Activity, BellRing, CheckCircle2, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { fetchApi } from '../lib/api';

interface PlatformStats { mrr: number; totalRestaurants: number; activeRestaurants: number; totalOrdersToday: number; monthlyRevenue: number; churnRate: number }

// Mock data to bring the dashboard to life
const revenueData: any[] = [];
const signupData: any[] = [];
const recentActivity: any[] = [];

export default function OverviewPage() {
  const { data: stats } = useQuery<PlatformStats>({ queryKey: ['saStats'], queryFn: () => fetchApi('/superadmin/stats') });
  const { data: restaurants } = useQuery<any>({ queryKey: ['saRestaurants'], queryFn: () => fetchApi('/superadmin/restaurants') });

  const statCards = [
    { label: 'MRR', value: `₹${(stats?.mrr || 0).toLocaleString()}`, icon: IndianRupee, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Restaurants', value: stats?.totalRestaurants || 0, icon: Building2, color: 'text-stone-950', bg: 'bg-stone-950/10' },
    { label: 'Active', value: stats?.activeRestaurants || 0, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Orders Today', value: stats?.totalOrdersToday || 0, icon: ShoppingBag, color: 'text-stone-950', bg: 'bg-stone-950/10' },
    { label: 'Churn Rate', value: `${stats?.churnRate || 0}%`, icon: Users, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20 p-4 lg:p-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Network Control</h1>
        <h2 className="text-3xl font-black text-stone-950 dark:text-white tracking-tighter uppercase leading-none">Platform Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="glass-card p-6 group active:scale-95">
            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-4 transition-transform group-hover:rotate-6`}>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">{card.label}</p>
            <h3 className="text-2xl font-black text-stone-950 dark:text-white mt-0.5 tracking-tighter">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <div className="lg:col-span-2 glass-card p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-stone-950 dark:text-white uppercase tracking-tighter">Revenue Growth</h3>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-0.5">Global MRR Performance</p>
              </div>
            </div>
            <select className="bg-stone-50 dark:bg-primary/5 border-none rounded-lg text-[9px] font-black uppercase tracking-widest px-4 py-2 focus:ring-2 focus:ring-primary/20 appearance-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b2b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ff6b2b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#78716c' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#78716c' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', padding: '1.5rem' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ff6b2b" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          {/* Activity Feed */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-stone-950 dark:text-white uppercase tracking-tighter">System Feed</h3>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-0.5">Real-time status updates</p>
              </div>
            </div>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex gap-3 group cursor-pointer">
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <item.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-stone-950 dark:text-white uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{item.message}</p>
                    <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="py-8 text-center text-stone-500 text-[9px] font-black uppercase tracking-[0.2em] border-2 border-dashed border-white/5 rounded-2xl">No recent activity detected</div>
              )}
            </div>
            <button className="w-full mt-8 py-3 bg-stone-50 dark:bg-primary/5 hover:bg-primary hover:text-white text-stone-950 dark:text-white group-hover:text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border border-stone-100 dark:border-primary/10 transition-all active:scale-95">
              View All logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
