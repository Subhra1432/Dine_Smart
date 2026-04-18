// ═══════════════════════════════════════════
// DineSmart — Billing Page
// ═══════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { getBillingTables, getBillingOrders, updateOrderStatus, updatePaymentStatus, printBill, printCustomerSummary } from '../lib/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/auth';
import {
  DollarSign, Clock, CheckCircle, X, Printer, CreditCard,
  Circle, AlertCircle, User, Phone
} from 'lucide-react';

interface BillingTable {
  id: string; number: number; capacity: number; isOccupied: boolean;
  status: string; branch: { name: string };
  activeOrder: { id: string; status: string; paymentStatus: string; total: number; createdAt: string; items: Array<{ menuItem: { name: string }; quantity: number; status: string }>; customer?: { name: string | null; phone: string } } | null;
}

export default function BillingPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [tableFilter, setTableFilter] = useState<'ALL' | 'PENDING' | 'UNPAID' | 'HISTORY'>('ALL');
  // When a status requiring payment confirmation is chosen, store it here
  const [pendingStatus, setPendingStatus] = useState<{ orderId: string; status: string } | null>(null);
  const location = useLocation();

  const isReadOnly = user?.role === 'OWNER';

  useEffect(() => {
    if (location.state?.autoSelectTableId) {
      setSelectedTableId(location.state.autoSelectTableId);
    }
  }, [location.state]);

  const groupItems = (items: any[]) => {
    const map: Record<string, any> = {};
    items.forEach(item => {
      const key = `${item.menuItem.name}-${item.status}`;
      if (map[key]) {
        map[key].quantity += item.quantity;
        if (item.totalPrice) map[key].totalPrice += item.totalPrice;
      } else {
        map[key] = { ...item };
      }
    });
    return Object.values(map);
  };

  const { data: tables } = useQuery<BillingTable[]>({
    queryKey: ['billingTables'],
    queryFn: () => getBillingTables() as Promise<BillingTable[]>,
    refetchInterval: 10000,
  });

  const { data: historyOrders } = useQuery({
    queryKey: ['billingHistory'],
    queryFn: () => getBillingOrders('status=COMPLETED') as Promise<{ items: any[]; total: number }>,
    enabled: tableFilter === 'HISTORY',
  });

  const filteredTables = useMemo(() => {
    if (!tables) return [];
    let result = tables;
    if (tableFilter === 'PENDING') result = tables.filter(t => t.activeOrder && t.status === 'DELAYED');
    else if (tableFilter === 'UNPAID') result = tables.filter(t => t.activeOrder?.paymentStatus === 'UNPAID');
    
    // Assort tables sequentially by number
    return [...result].sort((a, b) => a.number - b.number);
  }, [tables, tableFilter]);

  const selectedTable = useMemo(() => 
    tables?.find(t => t.id === selectedTableId) || null,
    [tables, selectedTableId]
  );

  // Socket.io for real-time
  useEffect(() => {
    const socket = io('/restaurant', { auth: { token: document.cookie } });
    socket.emit('join:billing');

    const dingAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

    socket.on('order:new', () => {
      queryClient.invalidateQueries({ queryKey: ['billingTables'] });
      toast.success('🔔 New order received!');
      dingAudio.play().catch(() => {});
    });

    socket.on('order:status_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['billingTables'] });
    });

    socket.on('payment:confirmed', () => {
      queryClient.invalidateQueries({ queryKey: ['billingTables'] });
      toast.success('💰 Payment received!');
    });

    socket.on('order:item_status_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['billingTables'] });
    });

    socket.on('payment:request_at_desk', (data: { tableNumber: number, total: number }) => {
      queryClient.invalidateQueries({ queryKey: ['billingTables'] });
      toast.error(`💳 Table #${data.tableNumber} requested check: ₹${data.total}`, { duration: 10000 });
      dingAudio.play().catch(() => {});
    });

    return () => { socket.disconnect(); };
  }, []);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      queryClient.invalidateQueries({ queryKey: ['billingTables'] });
      toast.success(`Order marked as ${status}`);
      if (status === 'COMPLETED') {
        setPendingStatus({ orderId, status });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const handlePayment = async (orderId: string, method: string) => {
    try {
      await updatePaymentStatus(orderId, 'PAID', method);
      queryClient.invalidateQueries({ queryKey: ['billingTables'] });
      setPendingStatus(null);
      toast.success(`Payment recorded via ${method}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handlePrintBill = async (orderId: string) => {
    try {
      const res = await printBill(orderId);
      const html = await res.text();
      const win = window.open('', '_blank');
      if (win) { win.document.write(html); win.print(); }
    } catch {
      toast.error('Failed to print bill');
    }
  };

  const handlePrintSummary = async (customerId: string) => {
    try {
      const res = await printCustomerSummary(customerId);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate summary');
      }
      const html = await res.text();
      const win = window.open('', '_blank');
      if (win) { win.document.write(html); win.print(); }
    } catch (err: any) {
      toast.error(err.message || 'Failed to print summary');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing Desk</h1>
          <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
             {['ALL', 'PENDING', 'UNPAID', 'HISTORY'].map(f => (
                <button
                   key={f}
                   onClick={() => setTableFilter(f as any)}
                   className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${tableFilter === f ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                   {f}
                </button>
             ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><Circle size={8} className="fill-emerald-500 text-emerald-500" /> Free</span>
          <span className="flex items-center gap-1"><Circle size={8} className="fill-amber-500 text-amber-500" /> Occupied</span>
          <span className="flex items-center gap-1"><Circle size={8} className="fill-red-500 text-red-500" /> Delayed</span>
        </div>
      </div>

      {/* Content Area */}
      {tableFilter === 'HISTORY' ? (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-500 uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Table</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {historyOrders?.items?.map(o => (
                <tr key={o.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-slate-500">#{o.id.slice(-6)}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">#{o.table?.number || '-'}</td>
                  <td className="px-4 py-3">
                    {o.customer ? (
                        <div className="flex flex-col">
                           <span className="font-semibold text-slate-900 dark:text-slate-300">{o.customer.name || 'Guest'}</span>
                           <span className="text-xs text-brand-400">{o.customer.phone}</span>
                        </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 truncate max-w-[200px]">
                    {o.items.map((i: any) => `${i.quantity}x ${i.menuItem?.name || 'Item'}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">₹{(o.total || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded font-bold text-[10px] uppercase">{o.paymentMethod || 'UNKNOWN'}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!historyOrders?.items?.length && (
                 <tr>
                   <td colSpan={7} className="px-4 py-10 text-center text-slate-500 font-medium">No payment history found.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filteredTables?.map((table) => (
            <button
              key={table.id}
              onClick={() => setSelectedTableId(table.id)}
              className={`p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-left flex flex-col h-40 ${
                table.status === 'FREE' ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50' :
                table.status === 'DELAYED' ? 'border-red-500/30 bg-red-500/5 hover:border-red-500/50 animate-pulse' :
                'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
              }`}
              id={`table-${table.number}`}
            >
              <div className="flex justify-between w-full items-start">
                  <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">#{table.number}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[80px]">{table.branch.name}</p>
                  </div>
                  {table.activeOrder && (
                      <div className="flex flex-col items-end gap-1">
                          <div className="px-2 py-1 rounded-lg bg-white/50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-700/50 flex flex-col items-end">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{table.activeOrder.status}</span>
                              <p className="text-sm text-brand-400 font-bold leading-tight">₹{table.activeOrder.total.toFixed(2)}</p>
                          </div>
                          {table.activeOrder.paymentStatus === 'PAID' && (
                              <div className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest animate-pulse">
                                  ✅ PAID ONLINE
                              </div>
                          )}
                      </div>
                  )}
              </div>
              
              {table.activeOrder ? (
                <div className="mt-auto w-full pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex flex-col gap-1 overflow-hidden h-12 mask-fade-bottom">
                        {groupItems(table.activeOrder.items).slice(0, 3).map((item, idx) => (
                            <p key={idx} className="text-xs text-slate-600 dark:text-slate-300 truncate">
                                <span className="font-bold text-slate-400 mr-1">{item.quantity}x</span> 
                                {item.menuItem.name}
                            </p>
                        ))}
                        {groupItems(table.activeOrder.items).length > 3 && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                +{groupItems(table.activeOrder.items).length - 3} more items
                            </p>
                        )}
                    </div>
                </div>
              ) : (
                  <div className="mt-auto w-full pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center h-12">
                       <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500/50">TABLE FREE</p>
                  </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Table Detail Panel */}
      {selectedTable && (
        <div className="fixed inset-y-0 right-0 w-96 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 z-50 overflow-y-auto animate-slide-in shadow-2xl">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
            <h2 className="text-lg font-bold">Table #{selectedTable.number}</h2>
            <button onClick={() => setSelectedTableId(null)} className="p-1 rounded-lg hover:bg-white dark:bg-slate-800">
              <X size={18} />
            </button>
          </div>

          {selectedTable.activeOrder ? (
            <div className="p-4 space-y-4">
              {/* Order Info */}
              <div className="bg-white dark:bg-slate-800/50 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Order #{selectedTable.activeOrder.id.slice(-6)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    selectedTable.activeOrder.status === 'READY' ? 'bg-emerald-500/20 text-emerald-400' :
                    selectedTable.activeOrder.status === 'PREPARING' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>{selectedTable.activeOrder.status}</span>
                </div>
                <p className="text-xs text-slate-500">{new Date(selectedTable.activeOrder.createdAt).toLocaleString()}</p>
                
                {selectedTable.activeOrder.customer ? (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                       Customer Details
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center">
                          <User size={14} className="text-brand-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                            {selectedTable.activeOrder.customer.name || 'Guest'}
                          </p>
                          <p className="text-xs font-semibold text-brand-400 flex items-center gap-1 leading-none mt-1">
                            {selectedTable.activeOrder.customer.phone}
                          </p>
                        </div>
                      </div>
                      <a href={`tel:${selectedTable.activeOrder.customer.phone}`} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                        <Phone size={14} className="text-brand-500" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                       Customer Details
                    </p>
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                         <User size={14} className="text-slate-400" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-none">Guest Walk-in</p>
                         <p className="text-xs text-slate-400 mt-0.5">Details unavailable</p>
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">ITEMS</p>
                {groupItems(selectedTable.activeOrder.items).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        item.status === 'READY' ? 'bg-emerald-500' :
                        item.status === 'PREPARING' ? 'bg-amber-500' :
                        'bg-slate-500'
                      }`} />
                      <span className="text-sm">{item.quantity}x {item.menuItem.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{item.status}</span>
                  </div>
                ))}
              </div>

              <div className="text-right text-lg font-bold text-brand-400">
                Total: ₹{selectedTable.activeOrder.total.toFixed(2)}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">STATUS</p>
                <div className="grid grid-cols-2 gap-2">
                  {['CONFIRMED', 'READY', 'SERVED', 'COMPLETED'].map((s) => (
                    <button
                      key={s}
                      onClick={() => !isReadOnly && handleStatusUpdate(selectedTable.activeOrder!.id, s)}
                      disabled={isReadOnly}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        selectedTable.activeOrder?.status === s
                          ? 'bg-brand-500 text-slate-900 dark:text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-700'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {/* Payment section — shown when still unpaid */}
              {selectedTable.activeOrder.paymentStatus !== 'PAID' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">PAYMENT METHOD</p>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">UNPAID</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['CASH', 'UPI', 'CARD', 'FREE'].map((m) => (
                      <button
                        key={m}
                        onClick={() => !isReadOnly && handlePayment(selectedTable.activeOrder!.id, m)}
                        disabled={isReadOnly}
                        className={`px-3 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/20 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500/20 hover:border-emerald-500/40'
                        } transition-colors`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-amber-400/80">⚠ Select payment method to mark as paid</p>
                </div>
              )}
              {selectedTable.activeOrder.paymentStatus === 'PAID' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">Payment Collected</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Edit Payment Method</p>
                  <div className="grid grid-cols-3 gap-2">
                     {['CASH', 'UPI', 'CARD', 'FREE'].map((m) => (
                      <button
                        key={m}
                        onClick={() => !isReadOnly && handlePayment(selectedTable.activeOrder!.id, m)}
                        disabled={isReadOnly}
                        className={`px-3 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold border border-slate-700 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700 hover:text-white'
                        } transition-colors`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePrintBill(selectedTable.activeOrder!.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Printer size={16} /> Bill
                </button>
                {selectedTable.activeOrder.customer && (
                  <button
                    onClick={() => handlePrintSummary(selectedTable.activeOrder!.customer!.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 text-slate-900 dark:text-white rounded-xl text-xs font-bold hover:bg-brand-600 transition-colors"
                  >
                    <CheckCircle size={16} /> Day Summary
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center py-12">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">Table is free</p>
            </div>
          )}
        </div>
      )}

      {/* Payment Confirmation Modal — pops up after key status changes */}
      {pendingStatus && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard size={28} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Select Payment Method</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Order status changed to <span className="font-bold text-brand-400">{pendingStatus.status}</span>.
                <br />How did the customer pay?
              </p>
            </div>
            <div className="p-6 space-y-3">
              {[
                { method: 'CASH', icon: '💵', label: 'Cash', desc: 'Physical notes & coins' },
                { method: 'UPI', icon: '📱', label: 'UPI / QR Code', desc: 'GPay, PhonePe, PayTM...' },
                { method: 'CARD', icon: '💳', label: 'Debit / Credit Card', desc: 'Swipe or tap' },
                { method: 'FREE', icon: '🎁', label: 'Complimentary / Free', desc: 'No charge for this order' },
              ].map(({ method, icon, label, desc }) => (
                <button
                  key={method}
                  onClick={() => handlePayment(pendingStatus.orderId, method)}
                  className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 border border-slate-200 dark:border-slate-700 hover:border-brand-500/40 rounded-2xl transition-all text-left group"
                >
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-brand-500 transition-colors">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </button>
              ))}
              <button
                onClick={() => setPendingStatus(null)}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mt-2"
              >
                Skip for now (mark payment later)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
