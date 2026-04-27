// ═══════════════════════════════════════════
// DineSmart — Admin Overview Page
// ═══════════════════════════════════════════

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getOverview, getRevenue } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { IndianRupee, ShoppingBag, TrendingUp, Clock, CreditCard, LayoutGrid, ArrowRight, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

interface OverviewData {
  todayRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  pendingPayments: number;
  tableTurnoverRate: number;
  paymentSplit: Array<{ paymentMethod: string; _count: number; _sum: { total: number } }>;
  recentOrders: Array<{
    id: string;
    tableId: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    table: { id: string; number: number };
    items: Array<{ menuItem: { name: string }; quantity: number }>;
  }>;
}

interface RevenueData {
  dataPoints: Array<{ date: string; revenue: number; orders: number }>;
  summary: { totalRevenue: number; totalOrders: number; avgOrderValue: number };
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

export default function OverviewPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isOwner = user?.role === 'OWNER';

  const { data: overview } = useQuery<OverviewData>({
    queryKey: ['overview'],
    queryFn: () => getOverview() as Promise<OverviewData>,
    refetchInterval: 60000,
  });

  const { data: revenueData } = useQuery<RevenueData>({
    queryKey: ['revenue'],
    queryFn: () => getRevenue() as Promise<RevenueData>,
  });

  useEffect(() => {
    const socket = io('/restaurant', { auth: { token: document.cookie } });
    socket.emit('join:billing'); // Overview usually needs billing room for revenue/orders

    socket.on('order:new', (order) => {
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success(`🎉 New Order! Table #${order.table?.number || '?'} placed an order.`);
    });

    socket.on('payment:confirmed', () => {
      queryClient.invalidateQueries({ queryKey: ['overview'] });
    });

    return () => { socket.disconnect(); };
  }, [queryClient]);

  const statCards = isOwner ? [
    { label: "Today's Revenue", value: `₹${(overview?.todayRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Orders', value: overview?.totalOrders || 0, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Avg Order Value', value: `₹${(overview?.avgOrderValue || 0).toFixed(0)}`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pending Payments', value: overview?.pendingPayments || 0, icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ] : [
    { label: 'Total Orders', value: overview?.totalOrders || 0, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Pending Payments', value: overview?.pendingPayments || 0, icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Table Turnover', value: `${(overview?.tableTurnoverRate || 0).toFixed(1)}x`, icon: LayoutGrid, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active Sessions', value: overview?.recentOrders?.filter(o => o.status !== 'COMPLETED').length || 0, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-on-surface dark:text-inverse-on-surface">Dashboard Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest dark:bg-inverse-surface rounded-2xl p-4 shadow-sm border border-outline-variant dark:border-outline dark:border-primary/10 hover:border-primary/30 transition-colors group">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-on-surface dark:text-inverse-on-surface mb-1">{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant dark:text-primary/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {isOwner && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-surface-container-lowest dark:bg-inverse-surface rounded-2xl p-6 shadow-sm border border-outline-variant dark:border-outline dark:border-primary/10">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
                    <TrendingUp size={18} className="text-primary" /> Revenue Growth
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mt-1">Last 30 Days Performance</p>
                </div>
            </div>
            <div className="h-72 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData?.dataPoints || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenues" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(d) => d.slice(5)} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                      formatter={(v: number) => [`₹${v.toFixed(0)}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenues)" />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Split */}
          <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-2xl p-6 shadow-sm border border-outline-variant dark:border-outline dark:border-primary/10">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
                    <Activity size={18} className="text-blue-500" /> Payment Split
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mt-1">Transaction Methods</p>
                </div>
            </div>
            <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview?.paymentSplit?.map((p) => ({
                        name: p.paymentMethod || 'Unknown',
                        value: p._count,
                      })) || []}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={85}
                      dataKey="value"
                      stroke="none"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {overview?.paymentSplit?.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-surface-container-lowest dark:bg-inverse-surface shadow-sm rounded-2xl border border-outline-variant dark:border-outline dark:border-primary/10 overflow-hidden mt-6">
        <div className="p-5 border-b border-outline-variant dark:border-outline dark:border-primary/10 flex justify-between items-center">
            <h3 className="font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
                <Zap size={18} className="text-yellow-500" /> Recent Orders Feed
            </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-semibold text-on-surface-variant dark:text-primary/40 border-b border-outline-variant dark:border-outline dark:border-primary/10 bg-surface-container-lowest/50 dark:bg-transparent">
                <th className="text-left py-4 px-4 font-bold uppercase tracking-wider">Order ID</th>
                <th className="text-center py-4 px-4 font-bold uppercase tracking-wider">Table</th>
                <th className="text-left py-4 px-4 font-bold uppercase tracking-wider">Items Summary</th>
                <th className="text-right py-4 px-4 font-bold uppercase tracking-wider">Total</th>
                <th className="text-center py-4 px-4 font-bold uppercase tracking-wider">Status</th>
                <th className="text-center py-4 px-4 font-bold uppercase tracking-wider">Payment</th>
                <th className="text-right py-4 px-4 font-bold uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {overview?.recentOrders?.map((order) => (
                <tr key={order.id} onClick={() => navigate('/billing', { state: { autoSelectTableId: order.tableId } })} className="border-b border-outline-variant dark:border-outline dark:border-primary/5 hover:bg-surface-container-low dark:hover:bg-inverse-surface/50 dark:hover:bg-primary/5 transition-colors cursor-pointer">
                  <td className="py-3 px-4">
                      <p className="text-sm font-bold text-on-surface dark:text-inverse-on-surface font-mono">#{order.id.slice(-6)}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                      <div className="mx-auto w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {order.table.number}
                      </div>
                  </td>
                  <td className="py-3 px-4">
                      <p className="text-xs font-medium text-on-surface-variant dark:text-inverse-on-surface max-w-[200px] truncate">
                        {order.items.map((i) => <span key={i.menuItem.name}><span className="text-outline font-bold">{i.quantity}x</span> {i.menuItem.name} &nbsp;</span>)}
                      </p>
                  </td>
                  <td className="py-3 px-4 text-right">
                      <span className="text-sm font-bold text-on-surface dark:text-inverse-on-surface">₹{order.total}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                      order.status === 'PREPARING' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                      order.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                      'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                    }`}>{order.status}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.paymentStatus === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                    }`}>{order.paymentStatus}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-xs font-semibold text-on-surface-variant dark:text-outline">
                    {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
