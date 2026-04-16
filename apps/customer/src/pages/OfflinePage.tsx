// ═══════════════════════════════════════════
// DineSmart — Offline Fallback Page
// ═══════════════════════════════════════════

import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
          <WifiOff size={36} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">You're Offline</h1>
        <p className="text-slate-400 mb-6">
          Please check your internet connection to browse the menu and place orders.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
