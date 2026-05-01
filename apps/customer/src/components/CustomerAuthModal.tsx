import { useState } from 'react';
import { Phone, User, ArrowRight, X, ShieldCheck, Mail, Lock } from 'lucide-react';
import { useCartStore } from '../store/cart';
import { sendOtp, verifyOtp } from '../lib/api';
import toast from 'react-hot-toast';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isForced?: boolean;
  slug: string;
}

export function CustomerAuthModal({ isOpen, onClose, onSuccess, isForced = false, slug }: CustomerAuthModalProps) {
  const { customerPhone, customerName, setCustomerInfo } = useCartStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState(customerPhone);
  const [name, setName] = useState(customerName);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    const sanitizedPhone = phone.replace(/[^\d+]/g, '');
    try {
      await sendOtp(slug, sanitizedPhone);
      setStep(2);
      toast.success('Security code sent!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    setLoading(true);
    const sanitizedPhone = phone.replace(/[^\d+]/g, '');
    try {
      await verifyOtp(slug, sanitizedPhone, otp, name);
      setCustomerInfo(sanitizedPhone, name);
      toast.success('Verification complete!');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div 
        className="absolute inset-0" 
        onClick={!isForced ? onClose : undefined}
      />
      
      <div className="relative w-full max-w-md bg-[#0D0D0D] border-t sm:border border-white/10 rounded-t-[3rem] sm:rounded-[2.5rem] shadow-[0_32px_80px_rgba(0,0,0,1)] overflow-hidden animate-slide-up">
        {/* Decorative Saffron Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#D97706]/10 rounded-full -mt-32 blur-[100px] pointer-events-none" />
        
        {/* Header */}
        <div className="p-8 pb-4 relative">
          {!isForced && (
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all text-white/60"
            >
              <X size={20} />
            </button>
          )}
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#D97706]/10 border border-[#D97706]/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(217,119,6,0.1)]">
              {step === 1 ? <User size={28} className="text-[#D97706]" /> : <Lock size={28} className="text-[#D97706]" />}
            </div>
            <h3 className="text-3xl font-serif font-black text-white tracking-tight mb-2">
              {step === 1 ? 'Guest Identity' : 'Verify Access'}
            </h3>
            <p className="text-[10px] font-black text-[#D97706] uppercase tracking-[0.4em] opacity-80">
              {step === 1 ? 'Initialize session manifest' : 'Enter security protocol code'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 pt-6">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#D97706] transition-colors" />
                  <input
                    required
                    type="text"
                    placeholder="YOUR FULL NAME"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] focus:border-[#D97706]/40 focus:outline-none focus:ring-4 focus:ring-[#D97706]/5 text-white transition-all placeholder:text-white/10"
                  />
                </div>

                <div className="relative group">
                  <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#D97706] transition-colors" />
                  <input
                    required
                    type="tel"
                    placeholder="MOBILE NUMBER"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] focus:border-[#D97706]/40 focus:outline-none focus:ring-4 focus:ring-[#D97706]/5 text-white transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_12px_30px_rgba(217,119,6,0.2)] overflow-hidden"
              >
                <div className="relative flex items-center justify-center gap-3">
                  <span className="uppercase tracking-[0.3em] text-[11px]">
                    {loading ? 'Transmitting...' : 'Request Security Code'}
                  </span>
                  {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </div>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center mb-8">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">
                  Code transmitted to
                </p>
                <p className="text-xl font-black text-white tracking-tighter">{phone}</p>
                <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black text-[#D97706] mt-4 uppercase tracking-[0.2em] hover:underline">
                  Modify Destination
                </button>
              </div>

              <div className="relative max-w-[240px] mx-auto group">
                <ShieldCheck size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#D97706] transition-colors" />
                <input
                  required
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-14 pr-6 py-5 bg-white/[0.03] border border-white/5 rounded-2xl text-white focus:border-[#D97706]/40 focus:outline-none focus:ring-4 focus:ring-[#D97706]/5 transition-all text-center tracking-[0.8em] font-black text-2xl placeholder:text-white/5"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 1}
                className="group relative w-full bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_12px_30px_rgba(217,119,6,0.2)] overflow-hidden"
              >
                <div className="relative flex items-center justify-center gap-3">
                  <span className="uppercase tracking-[0.3em] text-[11px]">
                    {loading ? 'Authenticating...' : 'Validate & Establish session'}
                  </span>
                  {!loading && <ShieldCheck size={18} />}
                </div>
              </button>
            </form>
          )}
          
          <div className="mt-8 flex flex-col items-center gap-4 text-center">
             <div className="w-1 h-1 bg-white/10 rounded-full" />
             <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] leading-relaxed max-w-[280px]">
               By establishing a session, you agree to our digital dining protocols and privacy manifest.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
