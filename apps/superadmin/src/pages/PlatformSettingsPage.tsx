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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-on-surface dark:text-inverse-on-surface">Platform Settings</h1>
        <p className="text-sm text-on-surface-variant dark:text-primary/60 mt-1">Configure global platform behavior</p>
      </div>

      {/* General Settings */}
      <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-2xl p-5 border border-outline-variant dark:border-primary/10">
        <h2 className="text-sm font-semibold text-on-surface-variant dark:text-primary/60 mb-4 flex items-center gap-2">
          <Globe size={14} /> GENERAL
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Platform Name</label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low dark:bg-inverse-surface rounded-xl text-sm text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-primary/20 focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low dark:bg-inverse-surface rounded-xl text-sm text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-primary/20 focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Registration Settings */}
      <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-2xl p-5 border border-outline-variant dark:border-primary/10">
        <h2 className="text-sm font-semibold text-on-surface-variant dark:text-primary/60 mb-4 flex items-center gap-2">
          <Shield size={14} /> ONBOARDING
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface dark:text-inverse-on-surface">Auto-Approve Registrations</p>
              <p className="text-xs text-on-surface-variant">New restaurants are activated immediately</p>
            </div>
            <button
              onClick={() => setAutoApproveRegistrations(!autoApproveRegistrations)}
              className={`w-12 h-6 rounded-full transition-colors relative ${autoApproveRegistrations ? 'bg-primary' : 'bg-surface-container dark:bg-inverse-surface-dim'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoApproveRegistrations ? 'left-[26px]' : 'left-0.5'}`} />
            </button>
          </div>
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Default Plan for New Restaurants</label>
            <select
              value={defaultPlan}
              onChange={(e) => setDefaultPlan(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low dark:bg-inverse-surface rounded-xl text-sm text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-primary/20 focus:border-primary focus:outline-none"
            >
              <option value="STARTER">Starter (₹999/mo)</option>
              <option value="GROWTH">Growth (₹2,499/mo)</option>
              <option value="PREMIUM">Premium (₹7,499/mo)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Free Trial Duration (days)</label>
            <input
              type="number"
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low dark:bg-inverse-surface rounded-xl text-sm text-on-surface dark:text-inverse-on-surface border border-outline-variant dark:border-primary/20 focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* System */}
      <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-2xl p-5 border border-outline-variant dark:border-primary/10">
        <h2 className="text-sm font-semibold text-on-surface-variant dark:text-primary/60 mb-4 flex items-center gap-2">
          <Database size={14} /> SYSTEM
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface dark:text-inverse-on-surface">Maintenance Mode</p>
              <p className="text-xs text-on-surface-variant">Temporarily disable access for all tenants</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${maintenanceMode ? 'bg-error' : 'bg-surface-container dark:bg-inverse-surface-dim'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${maintenanceMode ? 'left-[26px]' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="pt-2 border-t border-outline-variant dark:border-primary/10">
            <p className="text-xs text-on-surface-variant mb-2">System Info</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-surface-container-low dark:bg-inverse-surface p-2.5 rounded-lg">
                <span className="text-on-surface-variant">API Version:</span> <span className="text-on-surface dark:text-inverse-on-surface font-mono">1.0.0</span>
              </div>
              <div className="bg-surface-container-low dark:bg-inverse-surface p-2.5 rounded-lg">
                <span className="text-on-surface-variant">Environment:</span> <span className="text-on-surface dark:text-inverse-on-surface font-mono">development</span>
              </div>
              <div className="bg-surface-container-low dark:bg-inverse-surface p-2.5 rounded-lg">
                <span className="text-on-surface-variant">Database:</span> <span className="text-emerald-400 font-mono">Connected</span>
              </div>
              <div className="bg-surface-container-low dark:bg-inverse-surface p-2.5 rounded-lg">
                <span className="text-on-surface-variant">Redis:</span> <span className="text-emerald-400 font-mono">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-container transition-colors shadow-lg shadow-primary/20"
      >
        Save Settings
      </button>
    </div>
  );
}
