// ═══════════════════════════════════════════
// DineSmart — Payment Cancel Page
// ═══════════════════════════════════════════

import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCcw, ArrowLeft } from 'lucide-react';

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border-4 border-red-500/20">
          <XCircle size={48} className="text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Payment Cancelled
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            No worries! You weren't charged anything. You can try again whenever you're ready.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <button
            onClick={() => navigate('/admin/subscription')}
            className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <RefreshCcw size={20} /> Try Again
          </button>
          
          <button
            onClick={() => navigate('/admin')}
            className="w-full py-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
