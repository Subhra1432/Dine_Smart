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
    <div className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-saffron-500/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-xl w-full text-center space-y-10 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-1000 relative">
        <div className="relative mx-auto w-32 h-32 group">
          <div className="absolute inset-0 bg-saffron-500/30 rounded-[2.5rem] blur-2xl group-hover:scale-125 transition-transform duration-700 animate-pulse" />
          <div className="relative glass-card border-2 border-saffron-500/50 rounded-[2.5rem] w-32 h-32 flex items-center justify-center shadow-[0_0_50px_-10px_rgba(245,158,11,0.5)] rotate-3 group-hover:rotate-6 transition-transform duration-500">
            <CheckCircle2 size={64} className="text-saffron-500" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron-500/10 border border-saffron-500/20">
            <PartyPopper size={14} className="text-saffron-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-saffron-500">Authorization Successful</span>
          </div>
          <h1 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">
            Vault <span className="text-saffron-500">Secured</span>
          </h1>
          <p className="text-stone-400 font-medium max-w-md mx-auto leading-relaxed">
            Payment verified. Your industrial restaurant node has been successfully upgraded with premium telemetry protocols.
          </p>
        </div>

        {sessionId && (
          <div className="relative group max-w-xs mx-auto">
            <div className="absolute inset-0 bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[9px] font-black text-stone-500 uppercase tracking-[0.2em]">
              Receipt ID: <span className="text-white font-mono ml-1">{sessionId}</span>
            </div>
          </div>
        )}

        <div className="pt-6 space-y-6">
          <button
            onClick={() => navigate('/admin/subscription')}
            className="w-full max-w-sm mx-auto py-6 bg-white text-black hover:bg-saffron-500 font-black rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-2xl hover:scale-[1.02] active:scale-95 group/btn uppercase tracking-[0.4em] text-[10px]"
          >
            Access Vault Dashboard <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
          </button>
          
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-px bg-stone-800" />
            <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest">
              Auto-Redirecting in <span className="text-saffron-500">{countdown}s</span>
            </p>
            <div className="w-8 h-px bg-stone-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

