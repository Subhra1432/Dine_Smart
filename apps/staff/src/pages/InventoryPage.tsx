// ═══════════════════════════════════════════
// DineSmart — Inventory Page
// ═══════════════════════════════════════════

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getInventoryItems, getInventoryAlerts, updateStock } from '../lib/api';
import toast from 'react-hot-toast';
import { AlertTriangle, Package, Plus, Minus } from 'lucide-react';

interface InventoryItem {
  id: string; name: string; unit: string; currentStock: number; minThreshold: number; costPrice: number;
  branch: { name: string };
  menuItemInventory: Array<{ menuItem: { id: string; name: string } }>;
}

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [adjusting, setAdjusting] = useState<{ id: string; qty: string; reason: string } | null>(null);

  const { data: items } = useQuery<InventoryItem[]>({ queryKey: ['inventory'], queryFn: () => getInventoryItems() as Promise<InventoryItem[]> });
  const { data: alerts } = useQuery<InventoryItem[]>({ queryKey: ['inventoryAlerts'], queryFn: () => getInventoryAlerts() as Promise<InventoryItem[]> });

  const handleStockUpdate = async () => {
    if (!adjusting || !adjusting.qty || !adjusting.reason) { toast.error('Fill all fields'); return; }
    try {
      await updateStock(adjusting.id, parseFloat(adjusting.qty), adjusting.reason);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] });
      setAdjusting(null);
      toast.success('Stock updated');
    } catch { toast.error('Failed to update stock'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface dark:text-inverse-on-surface">Inventory</h1>
        {alerts && alerts.length > 0 && (
          <span className="flex items-center gap-1 bg-red-500/20 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full">
            <AlertTriangle size={12} /> {alerts.length} low stock alerts
          </span>
        )}
      </div>

      {/* Low Stock Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-red-400 mb-3">⚠️ LOW STOCK ALERTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {alerts.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-xl p-3">
                <div>
                  <p className="text-sm font-medium text-on-surface dark:text-inverse-on-surface">{item.name}</p>
                  <p className="text-xs text-on-surface-variant">{item.branch.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-400">{item.currentStock} {item.unit}</p>
                  <p className="text-[10px] text-on-surface-variant">Min: {item.minThreshold}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Items */}
      <div className="bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-2xl border border-outline-variant dark:border-outline/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-on-surface-variant border-b border-outline-variant dark:border-outline">
              <th className="text-left py-3 px-4">Item</th>
              <th className="text-left py-3 px-4">Branch</th>
              <th className="text-center py-3 px-4">Current Stock</th>
              <th className="text-center py-3 px-4">Min Threshold</th>
              <th className="text-center py-3 px-4">Cost/Unit</th>
              <th className="text-center py-3 px-4">Linked Items</th>
              <th className="text-center py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => {
              const isLow = item.currentStock <= item.minThreshold;
              return (
                <tr key={item.id} className={`border-b border-outline-variant dark:border-outline/30 ${isLow ? 'bg-red-500/5' : ''}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Package size={16} className={isLow ? 'text-red-400' : 'text-on-surface-variant dark:text-outline'} />
                      <span className="text-sm font-medium text-on-surface dark:text-inverse-on-surface">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-on-surface-variant dark:text-outline">{item.branch.name}</td>
                  <td className={`py-3 px-4 text-sm text-center font-semibold ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                    {item.currentStock} {item.unit}
                  </td>
                  <td className="py-3 px-4 text-sm text-center text-on-surface-variant">{item.minThreshold}</td>
                  <td className="py-3 px-4 text-sm text-center text-on-surface-variant dark:text-outline">₹{item.costPrice}</td>
                  <td className="py-3 px-4 text-xs text-center text-on-surface-variant">
                    {item.menuItemInventory.map((m) => m.menuItem.name).join(', ') || '—'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setAdjusting({ id: item.id, qty: '', reason: '' })}
                      className="px-3 py-1.5 bg-primary/20 text-primary text-xs rounded-lg hover:bg-primary/30"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stock Adjustment Modal */}
      {adjusting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-2xl p-6 w-full max-w-sm border border-outline-variant dark:border-outline">
            <h3 className="text-lg font-bold text-on-surface dark:text-inverse-on-surface mb-4">Adjust Stock</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-on-surface-variant dark:text-outline">Quantity (+ for add, - for remove)</label>
                <input
                  type="number"
                  value={adjusting.qty}
                  onChange={(e) => setAdjusting({ ...adjusting, qty: e.target.value })}
                  placeholder="e.g., 10 or -5"
                  className="w-full mt-1 px-4 py-2.5 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-outline focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-on-surface-variant dark:text-outline">Reason</label>
                <input
                  type="text"
                  value={adjusting.reason}
                  onChange={(e) => setAdjusting({ ...adjusting, reason: e.target.value })}
                  placeholder="e.g., Weekly restock"
                  className="w-full mt-1 px-4 py-2.5 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-outline focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setAdjusting(null)} className="flex-1 py-2.5 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl text-sm hover:bg-surface-container-high dark:hover:bg-inverse-surface/50">Cancel</button>
              <button onClick={handleStockUpdate} className="flex-1 py-2.5 bg-primary rounded-xl text-sm text-on-surface dark:text-inverse-on-surface font-semibold hover:bg-primary-container hover:text-on-primary-container">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
