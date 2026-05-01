// ═══════════════════════════════════════════
// DineSmart — Super Admin Platform Settings Page
// ═══════════════════════════════════════════

import { useState } from 'react';
import { Settings, Globe, Shield, Bell, Database } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PlatformSettingsPage() {
  const [platformName, setPlatformName] = useState('DineSmart OS');
  const [supportEmail, setSupportEmail] = useState('support@dinesmart.app');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApproveRegistrations, setAutoApproveRegistrations] = useState(true);
  const [defaultPlan, setDefaultPlan] = useState('STARTER');
  const [trialDays, setTrialDays] = useState('14');

  const handleSave = () => {
    toast.success('Platform settings saved (demo only)');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20 p-4 lg:p-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Core Configuration</h1>
        <h2 className="text-3xl font-black text-stone-950 dark:text-white tracking-tighter uppercase leading-none">Platform Settings</h2>
      </div>

      {/* General Settings */}
      <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-primary/10 shadow-sm">
        <h2 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2.5">
          <Globe size={14} className="text-primary" /> GENERAL ARCHITECTURE
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Platform Identifier</label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-xs font-black uppercase tracking-tighter text-stone-950 dark:text-white border border-stone-200 dark:border-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Support Channel (Email)</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-xs font-black uppercase tracking-tighter text-stone-950 dark:text-white border border-stone-200 dark:border-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Registration Settings */}
      <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-primary/10 shadow-sm">
        <h2 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2.5">
          <Shield size={14} className="text-primary" /> ONBOARDING PROTOCOLS
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-primary/10 transition-all hover:border-primary/30">
            <div>
              <p className="text-[11px] font-black text-stone-950 dark:text-white uppercase tracking-tighter">Auto-Approve Nodes</p>
              <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1">Instant activation protocol</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={autoApproveRegistrations}
                onChange={() => setAutoApproveRegistrations(!autoApproveRegistrations)}
              />
              <div className="premium-toggle">
                <div className="premium-toggle-dot" />
              </div>
            </label>
          </div>
          <div>
            <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Default Tier Deployment</label>
            <select
              value={defaultPlan}
              onChange={(e) => setDefaultPlan(e.target.value)}
              className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-xs font-black uppercase tracking-tighter text-stone-950 dark:text-white border border-stone-200 dark:border-primary/20 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="STARTER">Starter Protocol (₹999/mo)</option>
              <option value="PREMIUM">Premium Protocol (₹2,499/mo)</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Sandbox Duration (days)</label>
            <input
              type="number"
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
              className="w-full px-5 py-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-xs font-black uppercase tracking-tighter text-stone-950 dark:text-white border border-stone-200 dark:border-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* System */}
      <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-primary/10 shadow-sm">
        <h2 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2.5">
          <Database size={14} className="text-primary" /> SYSTEM INFRASTRUCTURE
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-primary/10 transition-all hover:border-error/30">
            <div>
              <p className="text-[11px] font-black text-stone-950 dark:text-white uppercase tracking-tighter">Maintenance Override</p>
              <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1">Global platform freeze</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={maintenanceMode}
                onChange={() => setMaintenanceMode(!maintenanceMode)}
              />
              <div className={`w-12 h-6 rounded-full relative transition-all duration-500 cursor-pointer border shadow-inner ${
                maintenanceMode 
                  ? 'bg-red-600/20 border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                  : 'bg-stone-200/50 dark:bg-stone-800/30 backdrop-blur-md border-stone-300/50 dark:border-white/10'
              }`}>
                <div className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-all duration-500 shadow-md ${
                  maintenanceMode 
                    ? 'translate-x-6 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                    : 'bg-white dark:bg-stone-300'
                }`} />
              </div>
            </label>
          </div>
          <div className="pt-6 border-t border-stone-100 dark:border-saffron-500/10">
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.4em] mb-5">Environment Status</p>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-stone-50 dark:bg-stone-800 p-5 rounded-2xl border border-stone-100 dark:border-saffron-500/10 group transition-all hover:border-saffron-500/30">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block mb-1">API Cluster</span>
                <span className="text-xs font-black text-stone-950 dark:text-white uppercase tracking-tighter group-hover:text-saffron-500 transition-colors">v1.0.0-Stable</span>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800 p-5 rounded-2xl border border-stone-100 dark:border-saffron-500/10 group transition-all hover:border-saffron-500/30">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block mb-1">Runtime Mode</span>
                <span className="text-xs font-black text-stone-950 dark:text-white uppercase tracking-tighter group-hover:text-saffron-500 transition-colors">Development</span>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800 p-5 rounded-2xl border border-stone-100 dark:border-saffron-500/10 group transition-all hover:border-saffron-500/30">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block mb-1">Core Database</span>
                <span className="text-xs font-black text-saffron-500 uppercase tracking-tighter">Operational</span>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800 p-5 rounded-2xl border border-stone-100 dark:border-saffron-500/10 group transition-all hover:border-saffron-500/30">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block mb-1">Cache Layer</span>
                <span className="text-xs font-black text-saffron-500 uppercase tracking-tighter">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-4 bg-saffron-500 text-white rounded-xl text-xs font-black uppercase tracking-[0.3em] hover:bg-stone-950 transition-all shadow-2xl shadow-saffron-500/30 active:scale-95"
      >
        Sync Configuration
      </button>
    </div>
  );
}
