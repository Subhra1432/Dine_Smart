import { useQuery } from '@tanstack/react-query';
import { IndianRupee, Building2, TrendingUp, ShoppingBag, Users, Activity, BellRing, CheckCircle2, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const API = '/api/v1';
const fetchApi = async (url: string, opts?: RequestInit) => {
  const res = await fetch(`${API}${url}`, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

interface PlatformStats { mrr: number; totalRestaurants: number; activeRestaurants: number; totalOrdersToday: number; monthlyRevenue: number; churnRate: number }

// Mock data to bring the dashboard to life
const revenueData = [
  { month: 'Jan', revenue: 2400 },
  { month: 'Feb', revenue: 3100 },
  { month: 'Mar', revenue: 4200 },
  { month: 'Apr', revenue: 3800 },
  { month: 'May', revenue: 5100 },
  { month: 'Jun', revenue: 6400 },
  { month: 'Jul', revenue: 7499 },
];

const signupData = [
  { day: 'Mon', signups: 4 },
  { day: 'Tue', signups: 7 },
  { day: 'Wed', signups: 5 },
  { day: 'Thu', signups: 12 },
  { day: 'Fri', signups: 8 },
  { day: 'Sat', signups: 15 },
  { day: 'Sun', signups: 10 },
];

const recentActivity = [
  { id: 1, type: 'signup', message: 'New restaurant signed up: "Spicy Grill"', time: '2 hours ago', icon: Building2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 2, type: 'payment', message: 'Subscription renewed by "Ocean Catch"', time: '5 hours ago', icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 3, type: 'alert', message: 'High load detected on DB replica', time: '12 hours ago', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 4, type: 'system', message: 'Automated platform backup completed', time: '1 day ago', icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

export default function OverviewPage() {
  const { data: stats } = useQuery<PlatformStats>({ queryKey: ['saStats'], queryFn: () => fetchApi('/superadmin/stats') });
  const { data: restaurants } = useQuery<any>({ queryKey: ['saRestaurants'], queryFn: () => fetchApi('/superadmin/restaurants') });

  const statCards = [
    { label: 'MRR', value: `₹${(stats?.mrr || 0).toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Restaurants', value: stats?.totalRestaurants || 0, icon: Building2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Active', value: stats?.activeRestaurants || 0, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Orders Today', value: stats?.totalOrdersToday || 0, icon: ShoppingBag, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Churn Rate', value: `${stats?.churnRate || 0}%`, icon: Users, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Overview</h1>
        <p className="text-sm text-slate-500 dark:text-brand-300/60 mt-1">DineSmart network statistics and health</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-brand-500/10 hover:border-brand-500/30 transition-colors group">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-brand-300/50">{stat.label}</p>
          </div>
        ))}
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-brand-500/10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp size={18} className="text-emerald-500" /> MRR Growth
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Monthly Recurring Revenue projection</p>
                    </div>
                </div>
                <div className="h-64 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-brand-500/10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users size={18} className="text-brand-500" /> Platform Sign-ups
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">New restaurant instances deployed</p>
                    </div>
                </div>
                <div className="h-64 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={signupData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                            />
                            <Bar dataKey="signups" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Right Column: Lists & Feeds */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-brand-500/10 shadow-sm overflow-hidden flex flex-col h-[351px]">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Zap size={18} className="text-yellow-500" /> Top Performers
                    </h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50 flex-1 overflow-y-auto">
                    {!restaurants?.items || restaurants.items.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">No active restaurants yet</div>
                    ) : (
                        restaurants.items.slice(0, 5).map((r: any, idx: number) => (
                            <div key={r.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-500 border border-slate-200 dark:border-slate-700">
                                        #{idx + 1}
                                    </div>
                                    <div className="overflow-hidden max-w-[120px]">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{r.name}</p>
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Plan: {r.plan}</p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-emerald-500">₹{r.monthlyRevenue?.toLocaleString() || 0}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black">{r._count.orders} Orders</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-brand-500/10 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BellRing size={18} className="text-brand-500" /> Recent Activity
                    </h3>
                    <button className="text-xs text-brand-500 hover:text-brand-400 font-bold uppercase tracking-wider">View All</button>
                </div>
                <div className="p-2 space-y-1">
                    {recentActivity.map((activity) => (
                        <div key={activity.id} className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.bg}`}>
                                <activity.icon size={16} className={activity.color} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-white line-clamp-2 leading-snug">{activity.message}</p>
                                <p className="text-[10px] font-bold tracking-wider uppercase text-slate-500 mt-1">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
