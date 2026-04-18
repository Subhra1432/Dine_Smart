// ═══════════════════════════════════════════
// DineSmart — Kitchen Display System (KDS)
// ═══════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getKitchenOrders, updateItemStatus, getBranches } from '../lib/api';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { Clock, ChefHat, Check, LogOut, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KitchenOrder {
  id: string;
  createdAt: string;
  table: { number: number };
  branch: { name: string };
  items: Array<{
    id: string;
    menuItem: { name: string; preparationTimeMinutes: number };
    quantity: number;
    status: string;
    specialInstructions: string;
    variant?: { name: string } | null;
  }>;
}

export default function KitchenPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { clearAuth, user } = useAuthStore();
  const isKitchenStaff = user?.role === 'KITCHEN_STAFF';
  const isOversight = user?.role === 'MANAGER' || user?.role === 'OWNER';
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(isOversight ? '' : (user?.branchId || ''));
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => getBranches(),
  });

  const { data: orders } = useQuery<KitchenOrder[]>({
    queryKey: ['kitchenOrders', selectedBranchId],
    queryFn: () => getKitchenOrders(selectedBranchId) as Promise<KitchenOrder[]>,
    refetchInterval: 15000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: string }) => updateItemStatus(itemId, status),
    onMutate: async ({ itemId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['kitchenOrders'] });
      const previousOrders = queryClient.getQueryData<KitchenOrder[]>(['kitchenOrders']);

      if (previousOrders) {
        // Optimistically update the item status
        const nextOrders = previousOrders.map(order => ({
          ...order,
          items: order.items.map(item => 
            item.id === itemId ? { ...item, status } : item
          )
        }));
        queryClient.setQueryData(['kitchenOrders'], nextOrders);
      }

      return { previousOrders };
    },
    onError: (err, _, context) => {
      // Revert if mutation fails
      if (context?.previousOrders) {
        queryClient.setQueryData(['kitchenOrders'], context.previousOrders);
      }
      toast.error(err instanceof Error ? err.message : 'Failed to update item');
    },
    onSettled: () => {
      // Sync with server ensuring everything is correct
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    }
  });

  useEffect(() => {
    // We now rely on the DOM audio element instead of instantiating in memory
    audioRef.current = document.getElementById('kitchen-audio') as HTMLAudioElement;
  }, []);

  // Socket.io
  useEffect(() => {
    const socket = io('/restaurant', { auth: { token: document.cookie } });
    socket.emit('join:kitchen');

    socket.on('order:new', () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
      toast('🔔 New order!', { icon: '🍳', duration: 5000 });
      if (audioEnabled && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    });

    socket.on('payment:request_at_desk', (data: { tableNumber: number }) => {
      toast(`💳 Table #${data.tableNumber} requested check`, { icon: '💰', duration: 10000 });
      if (audioEnabled && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    });

    socket.on('order:item_status_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    });

    return () => { socket.disconnect(); };
  }, [audioEnabled]);

  const handleItemStatus = (itemIds: string[], status: string) => {
    itemIds.forEach(itemId => {
      statusMutation.mutate({ itemId, status }, {
        onSuccess: () => {
          if (status === 'READY') toast.success('Item marked as ready!');
        }
      });
    });
  };

  const handleOrderAction = (order: KitchenOrder, action: 'START' | 'DONE') => {
    order.items.forEach(item => {
        if (action === 'START' && item.status === 'PENDING') {
            handleItemStatus([item.id], 'PREPARING');
        } else if (action === 'DONE' && (item.status === 'PREPARING' || item.status === 'PENDING')) {
            handleItemStatus([item.id], 'READY');
        }
    });
    toast.success(action === 'START' ? 'Started all pending items' : 'Marked all items as ready');
  };

  const groupKitchenItems = (items: any[]) => {
    const map: Record<string, any> = {};
    items.forEach(item => {
      const key = `${item.menuItem.name}-${item.status}-${item.specialInstructions || ''}`;
      if (map[key]) {
        map[key].quantity += item.quantity;
        map[key].ids.push(item.id);
      } else {
        map[key] = { ...item, ids: [item.id] };
      }
    });
    return Object.values(map);
  };

  const handleLogout = () => { clearAuth(); navigate('/login'); };

  const getElapsedMinutes = (createdAt: string) => {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  };

  return (
    <div className="bg-white dark:bg-[#000000] p-4 h-full">
      {/* Hidden audio element to avoid Autoplay restrictions */}
      <audio id="kitchen-audio" src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==" preload="auto" />
      
      {/* Top Bar */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChefHat size={28} className="text-brand-500" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Kitchen Display</h1>
            <p className="text-xs text-slate-500">{orders?.length || 0} active orders</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2.5 rounded-xl transition-colors ${audioEnabled ? 'bg-brand-500 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
          >
            {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          {branches && (
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Branches</option>
              {branches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <button onClick={handleLogout} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-400">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Order Cards Grid */}
      {orders && orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isUrgent = elapsed > 15;

            return (
              <div
                key={order.id}
                className={`rounded-2xl p-4 border-2 transition-all ${
                  isUrgent ? 'border-red-500 bg-red-500/5 animate-pulse' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">#{order.table.number}</span>
                    <span className="text-[10px] font-bold text-brand-500 bg-brand-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{order.branch.name}</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    <Clock size={12} />
                    {elapsed}m
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {groupKitchenItems(order.items).map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800/50 rounded-xl p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            <span className="text-brand-400 mr-1">{item.quantity}x</span>
                            {item.menuItem.name}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.variant.name}</p>
                          )}
                          {item.specialInstructions && (
                            <p className="text-xs text-amber-400 mt-1">📝 {item.specialInstructions}</p>
                          )}
                          <p className="text-[10px] text-slate-500 mt-0.5">Est. {item.menuItem.preparationTimeMinutes} min</p>
                        </div>

                        <div className="ml-2">
                          {isKitchenStaff && item.status === 'PENDING' && (
                            <button
                              onClick={() => handleItemStatus(item.ids, 'PREPARING')}
                              className="px-3 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-lg border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                            >
                              Start
                            </button>
                          )}
                          {isKitchenStaff && item.status === 'PREPARING' && (
                            <button
                              onClick={() => handleItemStatus(item.ids, 'READY')}
                              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                            >
                              <Check size={12} /> Done
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Overall Actions */}
                {isKitchenStaff && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                    <button
                      onClick={() => handleOrderAction(order, 'START')}
                      className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-xs rounded-xl transition-colors border border-amber-500/20"
                    >
                      START ALL
                    </button>
                    <button
                      onClick={() => handleOrderAction(order, 'DONE')}
                      className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-xs rounded-xl transition-colors border border-emerald-500/20"
                    >
                      COMPLETE ALL
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <ChefHat size={64} className="text-slate-700 mx-auto mb-4" />
            <p className="text-xl text-slate-500 font-semibold">No active orders</p>
            <p className="text-sm text-slate-600">New orders will appear here automatically</p>
          </div>
        </div>
      )}
    </div>
  );
}
