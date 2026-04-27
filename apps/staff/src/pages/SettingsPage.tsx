// ═══════════════════════════════════════════
// DineSmart — Settings Page
// ═══════════════════════════════════════════

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getProfile, getBranches, getTables, getUsers, getCoupons } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { Building, Users, QrCode, Tag, Settings, Trash2 } from 'lucide-react';
import { TableQRCode } from '../components/TableQRCode';

export default function SettingsPage() {
  const { restaurant, user } = useAuthStore();
  const isOwner = user?.role === 'OWNER';
  const isManager = user?.role === 'MANAGER';
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => getProfile() });
  const { data: branches, isLoading: branchesLoading } = useQuery({ queryKey: ['branches'], queryFn: () => getBranches() });
  const { data: tables, isLoading: tablesLoading } = useQuery({ queryKey: ['tables'], queryFn: () => getTables() });
  const { data: users } = useQuery({ 
    queryKey: ['users'], 
    queryFn: () => getUsers(),
    enabled: isOwner || isManager, // Only fetch for OWNER/MANAGER
  });
  const { data: coupons } = useQuery({ 
    queryKey: ['coupons'], 
    queryFn: () => getCoupons(),
    enabled: isOwner || isManager, // Only fetch for OWNER/MANAGER
  });

  const [creatingType, setCreatingType] = useState<'table' | 'user' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  
  const [tableFormData, setTableFormData] = useState({ number: '', capacity: '', branchId: '' });
  const [userFormData, setUserFormData] = useState({ email: '', password: '', role: 'CASHIER', branchId: '' });

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableFormData.branchId) {
      toast.error('Please select a branch');
      return;
    }
    if (!tableFormData.number || parseInt(tableFormData.number) <= 0) {
      toast.error('Please enter a valid table number');
      return;
    }
    if (!tableFormData.capacity || parseInt(tableFormData.capacity) <= 0) {
      toast.error('Please enter a valid capacity');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/restaurant/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          number: parseInt(tableFormData.number), 
          capacity: parseInt(tableFormData.capacity),
          branchId: tableFormData.branchId 
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create table');
      toast.success(`Table #${tableFormData.number} created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setCreatingType(null);
      setTableFormData({ number: '', capacity: '', branchId: '' });
    } catch (err: any) { 
      toast.error(err.message || 'Failed to create table'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDeleteTable = async (tableId: string, tableNumber: number) => {
    if (!confirm(`Delete Table #${tableNumber}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/v1/restaurant/tables/${tableId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(`Table #${tableNumber} deleted`);
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete table');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.email || !userFormData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/restaurant/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...userFormData,
          branchId: userFormData.branchId || undefined
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to invite user');
      toast.success('User invited successfully!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setCreatingType(null);
      setUserFormData({ email: '', password: '', role: 'CASHIER', branchId: '' });
    } catch (err: any) { 
      toast.error(err.message || 'Failed to invite user'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // Build the QR menu URL for a table using slug + table ID
  const getMenuUrl = (tableId: string) => {
    const base = testUrl || window.location.origin.replace(/:\d+$/, ':5173');
    return `${base}/menu?restaurant=${restaurant?.slug}&table=${tableId}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-on-surface dark:text-inverse-on-surface">Settings</h1>

      {/* Restaurant Profile */}
      <div className="bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-2xl p-5 border border-outline-variant dark:border-outline dark:border-outline">
        <h2 className="text-sm font-semibold text-on-surface-variant dark:text-outline mb-4 flex items-center gap-2">
          <Settings size={14} /> RESTAURANT PROFILE
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-on-surface-variant">Name</label>
            <p className="text-sm text-on-surface dark:text-inverse-on-surface font-medium">{restaurant?.name || '—'}</p>
          </div>
          <div>
            <label className="text-xs text-on-surface-variant">Slug</label>
            <p className="text-sm text-on-surface dark:text-inverse-on-surface font-mono">{restaurant?.slug || '—'}</p>
          </div>
          <div>
            <label className="text-xs text-on-surface-variant">Plan</label>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">{restaurant?.plan || '—'}</span>
          </div>
          <div>
            <label className="text-xs text-on-surface-variant">Role</label>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">{user?.role || '—'}</span>
          </div>
        </div>
      </div>

      {/* Branches */}
      <div className="bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-2xl p-5 border border-outline-variant dark:border-outline dark:border-outline">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-on-surface-variant dark:text-outline flex items-center gap-2">
            <Building size={14} /> BRANCHES
          </h2>
          {isOwner && (
            <button className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
              + Add Branch
            </button>
          )}
        </div>
        {branchesLoading ? (
          <p className="text-sm text-on-surface-variant">Loading branches...</p>
        ) : (
          <div className="space-y-2">
            {(branches as Array<{ id: string; name: string; address: string; phone: string; isActive: boolean }> | undefined)?.map((br) => (
              <div key={br.id} className="flex items-center justify-between p-3 bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-on-surface dark:text-inverse-on-surface">{br.name}</p>
                  <p className="text-xs text-on-surface-variant">{br.address}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${br.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {br.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
            {(!branches || (branches as any[]).length === 0) && (
              <p className="text-sm text-on-surface-variant text-center py-4">No branches yet</p>
            )}
          </div>
        )}
      </div>

      {/* Tables & QR Codes */}
      <div className="bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-2xl p-5 border border-outline-variant dark:border-outline dark:border-outline">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-on-surface-variant dark:text-outline flex items-center gap-2">
              <QrCode size={14} /> TABLES & SMART MENUS
            </h2>
            <p className="text-[10px] text-outline mt-1">QR codes for tables will point to your DineSmart customer portal</p>
          </div>
          <button onClick={() => setCreatingType('table')} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">+ Create Table</button>
        </div>

        {/* QR Testing URL Override */}
        <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
          <label className="block text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Local Testing Override</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. http://192.168.0.101:5173" 
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="flex-1 px-4 py-2 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl text-xs border border-primary/20 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface dark:text-inverse-on-surface"
            />
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2">
            Professional Tip: We've defaulted this to your local network IP (if empty) to test on a physical mobile device.
          </p>
        </div>

        {tablesLoading ? (
          <p className="text-sm text-on-surface-variant">Loading tables...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(tables as Array<{ id: string; number: number; capacity: number; qrCodeUrl: string }> | undefined)?.sort((a, b) => a.number - b.number).map((t) => (
              <div key={t.id} className="relative group">
                {(isOwner || isManager) && (
                  <button
                    onClick={() => handleDeleteTable(t.id, t.number)}
                    className="absolute top-2 right-2 z-10 p-2 rounded-xl bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                    title="Delete table"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <TableQRCode 
                  tableNumber={t.number} 
                  qrCodeUrl={getMenuUrl(t.id)} 
                  baseUrlOverride={testUrl || undefined} 
                />
              </div>
            ))}
            {(!tables || (tables as any[]).length === 0) && (
              <div className="col-span-full text-center py-12 bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-3xl border-2 border-dashed border-outline-variant dark:border-outline">
                <QrCode size={48} className="text-outline mx-auto mb-4" />
                <p className="text-sm text-on-surface-variant">No tables created yet. Start by adding your first table!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Users */}
      {(isOwner || isManager) && (
        <div className="bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-2xl p-5 border border-outline-variant dark:border-outline dark:border-outline">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-on-surface-variant dark:text-outline flex items-center gap-2">
              <Users size={14} /> TEAM MEMBERS
            </h2>
            {isOwner && (
              <button onClick={() => setCreatingType('user')} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                + Invite User
              </button>
            )}
          </div>
          <div className="space-y-2">
            {(users as Array<{ id: string; email: string; role: string; isActive: boolean; branch?: { name: string } }> | undefined)?.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-on-surface dark:text-inverse-on-surface">{u.email}</p>
                  <p className="text-xs text-on-surface-variant">{u.branch?.name || 'All branches'}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-400">{u.role}</span>
              </div>
            ))}
            {(!users || (users as any[]).length === 0) && (
              <p className="text-sm text-on-surface-variant text-center py-4">No team members found</p>
            )}
          </div>
        </div>
      )}

      {/* Coupons */}
      {(isOwner || isManager) && (
        <div className="bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-2xl p-5 border border-outline-variant dark:border-outline dark:border-outline">
          <h2 className="text-sm font-semibold text-on-surface-variant dark:text-outline mb-4 flex items-center gap-2">
            <Tag size={14} /> ACTIVE COUPONS
          </h2>
          <div className="space-y-2">
            {(coupons as Array<{ id: string; code: string; discountType: string; discountValue: number; usedCount: number; maxUses: number; isActive: boolean }> | undefined)?.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-surface-container-lowest dark:bg-inverse-surface/50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-primary">{c.code}</p>
                  <p className="text-xs text-on-surface-variant">{c.discountType === 'PERCENT' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant dark:text-outline">{c.usedCount}/{c.maxUses} used</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${c.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
            {(!coupons || (coupons as any[]).length === 0) && (
              <p className="text-sm text-on-surface-variant text-center py-4">No coupons created yet</p>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {creatingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-2xl p-6 w-full max-w-sm border border-outline-variant dark:border-outline">
            <h3 className="text-lg font-bold text-on-surface dark:text-inverse-on-surface mb-4">
              {creatingType === 'table' ? 'Create Table' : 'Invite User'}
            </h3>
            
            {creatingType === 'table' ? (
              <form onSubmit={handleCreateTable} className="space-y-3">
                <select 
                  required 
                  value={tableFormData.branchId} 
                  onChange={e => setTableFormData({ ...tableFormData, branchId: e.target.value })}
                  className="w-full px-4 py-2 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-outline text-sm"
                >
                  <option value="">Select Branch</option>
                  {(branches as any[])?.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <input required type="number" min="1" placeholder="Table Number" value={tableFormData.number} onChange={e => setTableFormData({ ...tableFormData, number: e.target.value })} className="w-full px-4 py-2 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-outline" />
                <input required type="number" min="1" placeholder="Capacity (e.g. 4)" value={tableFormData.capacity} onChange={e => setTableFormData({ ...tableFormData, capacity: e.target.value })} className="w-full px-4 py-2 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-outline" />
                <div className="flex gap-2 mt-6">
                  <button type="button" onClick={() => setCreatingType(null)} className="flex-1 py-2.5 bg-surface-container-low dark:bg-inverse-surface dark:bg-inverse-surface rounded-xl text-sm font-semibold text-on-surface-variant dark:text-white">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50">
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-3">
                <select 
                  value={userFormData.branchId} 
                  onChange={e => setUserFormData({ ...userFormData, branchId: e.target.value })}
                  className="w-full px-4 py-2 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-outline text-sm"
                >
                  <option value="">All Branches</option>
                  {(branches as any[])?.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <input required type="email" placeholder="Email Address" value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} className="w-full px-4 py-2 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-outline" />
                <input required type="password" placeholder="Temporary Password" value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} className="w-full px-4 py-2 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-outline" />
                <select value={userFormData.role} onChange={e => setUserFormData({ ...userFormData, role: e.target.value })} className="w-full px-4 py-2 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-outline">
                  <option value="MANAGER">Manager</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="KITCHEN_STAFF">Kitchen Staff</option>
                </select>
                <div className="flex gap-2 mt-6">
                  <button type="button" onClick={() => setCreatingType(null)} className="flex-1 py-2.5 bg-surface-container-low dark:bg-inverse-surface dark:bg-inverse-surface rounded-xl text-sm font-semibold text-on-surface-variant dark:text-white">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50">
                    {isSubmitting ? 'Inviting...' : 'Invite'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
