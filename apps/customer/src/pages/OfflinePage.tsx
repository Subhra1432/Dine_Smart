// ═══════════════════════════════════════════
// DineSmart — Offline Fallback Page
// ═══════════════════════════════════════════

import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface p-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-6">
          <WifiOff size={36} className="text-on-surface-variant" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-2">You're Offline</h1>
        <p className="text-on-surface-variant mb-6">
          Please check your internet connection to browse the menu and place orders.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-lg shadow-primary/20"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
