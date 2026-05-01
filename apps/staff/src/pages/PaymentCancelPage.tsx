// ═══════════════════════════════════════════
// DineSmart — Payment Cancel Page
// ═══════════════════════════════════════════

import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCcw, ArrowLeft } from 'lucide-react';

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full text-center space-y-10 animate-in fade-in zoom-in duration-700 relative">
        <div className="relative mx-auto w-32 h-32 group">
          <div className="absolute inset-0 bg-red-500/20 rounded-[2.5rem] blur-2xl group-hover:scale-125 transition-transform duration-700" />
          <div className="relative glass-card border-2 border-red-500/30 rounded-[2.5rem] w-32 h-32 flex items-center justify-center shadow-2xl -rotate-3 group-hover:-rotate-6 transition-transform duration-500">
            <XCircle size={64} className="text-red-500" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <XCircle size={14} className="text-stone-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Protocol Aborted</span>
          </div>
          <h1 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">
            Vault <span className="text-red-500">Locked</span>
          </h1>
          <p className="text-stone-400 font-medium max-w-md mx-auto leading-relaxed">
            Transaction sequence interrupted. No assets were deployed and vault credentials remains unchanged.
          </p>
        </div>

        <div className="pt-6 space-y-4">
          <button
            onClick={() => navigate('/admin/subscription')}
            className="w-full max-w-sm mx-auto py-6 bg-white text-black hover:bg-red-500 hover:text-white font-black rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-2xl hover:scale-[1.02] active:scale-95 group/btn uppercase tracking-[0.4em] text-[10px]"
          >
            <RefreshCcw size={18} className="group-hover/btn:rotate-180 transition-transform duration-700" /> 
            Re-Initialize Protocol
          </button>
          
          <button
            onClick={() => navigate('/admin')}
            className="w-full max-w-sm mx-auto py-4 text-stone-500 hover:text-white font-black uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-2 transition-all group/back"
          >
            <ArrowLeft size={14} className="group-hover/back:-translate-x-1 transition-transform" /> 
            Return to Command Center
          </button>
        </div>

        {/* Security Note */}
        <div className="pt-10 flex items-center justify-center gap-3 opacity-30">
          <div className="w-12 h-px bg-stone-800" />
          <p className="text-[8px] font-black text-stone-600 uppercase tracking-[0.4em]">Secure Session Intact</p>
          <div className="w-12 h-px bg-stone-800" />
        </div>
      </div>
    </div>
  );
}

