import { useState } from 'react';
import { Phone, User, ArrowRight, X, ShieldCheck, Mail } from 'lucide-react';
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
    try {
      await sendOtp(slug, phone);
      setStep(2);
      toast.success('OTP Sent!');
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
    try {
      await verifyOtp(slug, phone, otp, name);
      setCustomerInfo(phone, name);
      toast.success('Verified successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={!isForced ? onClose : undefined}
      />
      <div className="relative w-full max-w-md bg-surface-container border border-outline-variant rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-primary p-6 text-on-primary relative">
          {!isForced && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 bg-on-primary/20 rounded-full hover:bg-on-primary/30 transition-colors text-on-primary"
            >
              <X size={18} />
            </button>
          )}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-on-primary/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <User size={20} className="text-on-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Welcome!</h3>
              <p className="text-on-primary/80 text-xs">Verify your details to place your order</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">
                  Your Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-highest border border-outline-variant rounded-2xl text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-highest border border-outline-variant rounded-2xl text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-error text-center animate-shake">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary hover:text-on-primary-container font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-6"
              >
                {loading ? <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> : 'Send OTP'}
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-sm text-on-surface-variant">
                  Enter the 6-digit verification code sent to <br/>
                  <span className="text-on-surface font-bold">{phone}</span>
                </p>
                <button type="button" onClick={() => setStep(1)} className="text-primary text-xs mt-2 hover:underline">
                  Change number
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1 text-center">
                  Verification Code
                </label>
                <div className="relative max-w-[200px] mx-auto">
                  <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    required
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-highest border border-outline-variant rounded-2xl text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50 text-center tracking-[0.5em] font-bold text-lg"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-error text-center animate-shake">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 1}
                className="w-full bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary hover:text-on-primary-container font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-6"
              >
                {loading ? <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> : 'Verify & Login'}
                {!loading && <ShieldCheck size={18} />}
              </button>
            </form>
          )}
          
          <p className="text-center text-[10px] text-on-surface-variant mt-6 leading-relaxed">
            By continuing, you agree to receive order updates and loyalty rewards on this number.
          </p>
        </div>
      </div>
    </div>
  );
}
