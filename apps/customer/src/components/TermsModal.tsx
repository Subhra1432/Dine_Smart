import { useState } from 'react';
import { Shield, Check, Info, FileText } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function TermsModal({ isOpen, onAccept }: TermsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isBottom) setHasScrolledToBottom(true);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[3rem] shadow-[0_32px_80px_rgba(0,0,0,1)] overflow-hidden animate-slide-up">
        {/* Decorative Saffron Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#D97706]/10 rounded-full -mt-32 blur-[100px] pointer-events-none" />
        
        {/* Header */}
        <div className="p-8 pb-4 relative">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#D97706]/10 border border-[#D97706]/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(217,119,6,0.1)]">
              <Shield size={28} className="text-[#D97706]" />
            </div>
            <h3 className="text-3xl font-serif font-black text-white tracking-tight mb-2">Digital Protocols</h3>
            <p className="text-[10px] font-black text-[#D97706] uppercase tracking-[0.4em] opacity-80">Security & Usage Manifest</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 pt-6">
          <div 
            className="h-72 overflow-y-auto pr-4 mb-8 custom-scrollbar text-sm text-white/50 leading-relaxed space-y-6 text-justify bg-white/[0.02] p-6 rounded-3xl border border-white/5"
            onScroll={handleScroll}
          >
            <section>
              <h4 className="font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <div className="w-1.5 h-1.5 bg-[#D97706] rounded-full" />
                1. Acceptance of Terms
              </h4>
              <p className="text-xs">
                By accessing and using the DineSmart Digital Menu & Ordering System ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h4 className="font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <div className="w-1.5 h-1.5 bg-[#D97706] rounded-full" />
                2. Use of Service
              </h4>
              <p className="text-xs">
                DineSmart provides a digital platform for viewing restaurant menus and placing orders. You are responsible for ensuring the accuracy of your order and providing a valid mobile number for order tracking.
              </p>
            </section>

            <section>
              <h4 className="font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <div className="w-1.5 h-1.5 bg-[#D97706] rounded-full" />
                3. Privacy & Data
              </h4>
              <p className="text-xs">
                We collect your name and phone number to facilitate order processing, status updates, and loyalty rewards. Your data is handled in accordance with our Privacy Policy and will not be shared with third parties for marketing without your consent.
              </p>
            </section>

            <section>
              <h4 className="font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <div className="w-1.5 h-1.5 bg-[#D97706] rounded-full" />
                4. Liability
              </h4>
              <p className="text-xs">
                The restaurant is solely responsible for the quality, preparation, and accuracy of the food items. DineSmart is not liable for any discrepancies in food quality or service provided by the restaurant.
              </p>
            </section>
            
            <div className="pt-4 border-t border-white/5 text-center italic text-[9px] text-white/20 uppercase tracking-widest">
              Last updated: April 30, 2026
            </div>
          </div>

          <div className="space-y-6">
            {!hasScrolledToBottom && (
              <p className="text-[10px] text-[#D97706] text-center font-black uppercase tracking-[0.2em] animate-pulse">
                Scroll to authenticate manifest
              </p>
            )}

            <button
              onClick={onAccept}
              disabled={!hasScrolledToBottom}
              className="group relative w-full bg-gradient-to-r from-[#D97706] to-[#B45309] disabled:from-white/10 disabled:to-white/5 disabled:opacity-30 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_15px_40px_rgba(217,119,6,0.3)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[11px]">
                {hasScrolledToBottom ? 'Accept & Initialize' : 'Review Manifest'}
                <Check size={18} />
              </span>
            </button>
            
            <p className="text-[9px] font-bold text-center text-white/20 uppercase tracking-widest">
              Session persistence will be established upon acceptance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
