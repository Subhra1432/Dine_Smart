import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cart';

export default function TakeawayEntry() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { setCustomerInfo, setTakeawayMode } = useCartStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || phone.length < 10) return;
    
    // Store in session
    setCustomerInfo(phone, name);
    setTakeawayMode(true);
    // Navigate to menu with a takeaway query parameter or just state
    navigate(`/${slug}?mode=takeaway`);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(var(--primary),0.2)]">
            <ShoppingBag className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-on-surface uppercase tracking-tighter">Self Pickup</h1>
          <p className="text-on-surface-variant font-bold">Enter your details to start ordering.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-container p-6 rounded-3xl border border-outline-variant/30 space-y-6 shadow-xl">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
                minLength={10}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || phone.length < 10}
            className="w-full bg-primary text-on-primary font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 uppercase tracking-widest"
          >
            Start Ordering <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
