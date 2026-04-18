// ═══════════════════════════════════════════
// DineSmart — Payment Success Page
// ═══════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, PartyPopper } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { getMe } from '../lib/api';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);
  const { setAuth } = useAuthStore();

  useEffect(() => {
    // Refresh user data to get the new plan status
    getMe().then((me: any) => {
      setAuth(
        {
          userId: me.user.id,
          email: me.user.email,
          role: me.user.role,
          restaurantId: me.user.restaurantId,
          branchId: me.user.branchId,
        },
        me.restaurant
      );
    });

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/admin/subscription');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, setAuth]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
          <div className="relative bg-emerald-500 rounded-full w-24 h-24 flex items-center justify-center shadow-lg shadow-emerald-500/40">
            <CheckCircle2 size={48} className="text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            Payment Successful! <PartyPopper className="text-amber-400" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Your plan has been upgraded successfully. Welcome to a better DineSmart experience!
          </p>
        </div>

        {sessionId && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 uppercase">
            Receipt ID: {sessionId}
          </div>
        )}

        <div className="pt-4 space-y-4">
          <button
            onClick={() => navigate('/admin/subscription')}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            Go to Subscriptions <ArrowRight size={20} />
          </button>
          
          <p className="text-xs text-slate-400">
            Redirecting automatically in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
