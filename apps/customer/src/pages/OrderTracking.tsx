// ═══════════════════════════════════════════
// DineSmart — Order Tracking Page
// ═══════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Clock, ChefHat, Bell, UtensilsCrossed, Star, Download, Printer, ChevronRight, X, ShieldCheck, CreditCard, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrderBySession, submitReview, requestPaymentAttention } from '../lib/api';
import { io } from 'socket.io-client';

const STATUS_STEPS = [
  { key: 'CONFIRMED', label: 'Confirmed', icon: Check, description: 'Your order has been received' },
  { key: 'PREPARING', label: 'Preparing', icon: ChefHat, description: 'Our chefs are cooking your food' },
  { key: 'READY', label: 'Ready', icon: Bell, description: 'Your order is ready for pickup' },
  { key: 'SERVED', label: 'Served', icon: UtensilsCrossed, description: 'Enjoy your meal!' },
];

const STATUS_INDEX: Record<string, number> = {
  PENDING: -1,
  CONFIRMED: 0,
  PREPARING: 1,
  READY: 2,
  SERVED: 3,
  COMPLETED: 4,
};

interface Order {
  id: string;
  sessionId: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
  table: { number: number };
  restaurant: { slug: string; name: string };
  items: Array<{
    id: string;
    menuItem: { name: string };
    quantity: number;
    totalPrice: number;
    status: string;
  }>;
}

export default function OrderTracking() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [currentStatus, setCurrentStatus] = useState('PENDING');
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [itemRatings, setItemRatings] = useState<Record<string, number>>({});
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [requestedAttention, setRequestedAttention] = useState(false);

  const { data: orders, refetch } = useQuery<Order[]>({
    queryKey: ['order', sessionId],
    queryFn: () => getOrderBySession(sessionId!) as Promise<Order[]>,
    enabled: !!sessionId,
    refetchInterval: 10000,
  });

  const order = orders?.[0];

  useEffect(() => {
    if (!order) return;

    const socket = io('/restaurant', {
      auth: { role: 'customer' },
    });

    socket.emit('join:table', order.table?.number ? `table-${order.id}` : undefined);

    socket.on('order:status_updated', (data: { id: string; status: string }) => {
      if (data.id === order.id) {
        setCurrentStatus(data.status);
        refetch();
        toast.success(`Order status: ${data.status}`, {
            style: {
                background: '#0f172a',
                color: '#fff',
                borderRadius: '1rem',
                border: '1px solid rgba(255,255,255,0.1)'
            }
        });
      }
    });

    socket.on('payment:confirmed', (data: { orderId: string }) => {
      if (data.orderId === order.id) {
        refetch();
        toast.success('Payment confirmed!', {
            icon: '✅',
            style: {
                background: '#0f172a',
                color: '#fff',
                borderRadius: '1rem',
                border: '1px solid rgba(255,255,255,0.1)'
            }
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [order?.id]);

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
    }
  }, [order?.status]);

  const handleSubmitReview = async () => {
    if (!order || rating === 0) return;
    try {
      await submitReview(order.id, rating, comment, itemRatings);
      setReviewSubmitted(true);
      toast.success('Thank you for your review!');
    } catch {
      toast.error('Failed to submit review');
    }
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-900 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-6 text-slate-400 font-medium animate-pulse uppercase tracking-widest text-[10px]">Retrieving your order...</p>
      </div>
    );
  }

  const statusIdx = STATUS_INDEX[currentStatus] ?? -1;
  const isCompleted = currentStatus === 'COMPLETED' || currentStatus === 'SERVED';

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-brand-500/30 pb-12">
      {/* Top Navigation */}
      <nav className="p-6 flex items-center justify-between">
        <Link to="/" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
          <ChevronRight size={20} className="text-white rotate-180" />
        </Link>
        <div className="text-center">
            <h1 className="text-sm font-black text-white tracking-widest uppercase">TRACKING</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ORDER #{order.id.slice(-6).toUpperCase()}</p>
        </div>
        <div className="w-10 h-10 invisible" />
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-4 text-center">
        <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-brand-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-pulse-slow">
              <Check size={40} className="text-white" strokeWidth={3} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 border-4 border-slate-950 rounded-full flex items-center justify-center">
                <span className="text-lg">🔥</span>
            </div>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Order Confirmed</h2>
        <p className="text-sm text-slate-400 max-w-[240px] mx-auto leading-relaxed">
            Your meal is being prepared at <span className="text-white font-bold">DineSmart Kitchen</span>.
        </p>
      </section>

      <main className="px-6 py-10 space-y-8">
        {/* Status Tracker */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-brand-500 rounded-full" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">LIVE PROGRESS</h3>
            </div>
            
            <div className="space-y-10 relative">
                {/* Vertical Line Gap Filler */}
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/5" />
                
                {STATUS_STEPS.map((step, idx) => {
                    const isActive = idx === statusIdx;
                    const isComplete = idx < statusIdx;
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className="flex items-start gap-6 relative group">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 border-2 ${
                                isComplete ? 'bg-green-500 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' :
                                isActive ? 'bg-brand-500 border-brand-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-110' :
                                'bg-slate-900 border-white/5 grayscale opacity-40'
                            }`}>
                                <Icon size={18} className="text-white" strokeWidth={isComplete || isActive ? 3 : 2} />
                            </div>
                            
                            <div className="flex-1 pt-1">
                                <h4 className={`text-sm font-black tracking-tight mb-1 transition-colors ${
                                    isActive ? 'text-white' : isComplete ? 'text-green-400' : 'text-slate-500'
                                }`}>
                                    {step.label.toUpperCase()}
                                </h4>
                                <p className={`text-[10px] font-medium leading-relaxed ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">BILLING SUMMARY</h3>
                    <span className="text-[10px] font-black text-brand-500 uppercase">Table #{order.table.number}</span>
                </div>
            </div>
            
            <div className="p-8 space-y-6">
                {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between group">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-black text-white">{item.quantity}x</span>
                                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{item.menuItem.name}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${
                                item.status === 'READY' ? 'text-green-400' :
                                item.status === 'PREPARING' ? 'text-brand-400' :
                                'text-slate-600'
                            }`}>{item.status}</span>
                        </div>
                        <span className="text-sm font-black text-white">₹{item.totalPrice}</span>
                    </div>
                ))}

                <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500">SUBTOTAL</span>
                        <span className="text-slate-300">₹{order.subtotal}</span>
                    </div>
                    {order.discount > 0 && (
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-green-500">EXCLUSIVE DISCOUNT</span>
                            <span className="text-green-500">-₹{order.discount}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500">GST (5%)</span>
                        <span className="text-slate-300">₹{order.tax.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-xs font-black text-white uppercase tracking-widest">TOTAL AMOUNT</span>
                        <span className="text-2xl font-black text-white tracking-tighter">₹{order.total.toFixed(0)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Payment & Rebranding */}
        <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${
            order.paymentStatus === 'PAID'
            ? 'bg-green-500/10 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]'
            : 'bg-black border-slate-900 shadow-[0_0_30px_rgba(0,0,0,0.5)]'
        }`}>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">PAYMENT STATUS</h4>
                    <p className={`text-xl font-black tracking-tight ${
                        order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-brand-400'
                    }`}>
                        {order.paymentStatus === 'PAID' ? 'SETTLED SECURELY' : (currentStatus === 'SERVED' ? 'PAYMENT REQUIRED' : 'AWAITING PAYMENT')}
                    </p>
                </div>
                {order.paymentStatus !== 'PAID' && (
                    <button
                        onClick={() => setShowPaymentGateway(true)}
                        className="px-8 py-3 bg-brand-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-500/30 hover:bg-brand-400 active:scale-95 transition-all border-b-4 border-brand-700 active:border-b-0"
                    >
                        PAY NOW
                    </button>
                )}
                {order.paymentStatus !== 'PAID' && (
                    <button
                        onClick={async () => {
                            try {
                                await requestPaymentAttention(order.id);
                                setRequestedAttention(true);
                                toast.success('Staff notified. Please wait at your table.', {
                                    icon: '🙌',
                                    style: {
                                        background: '#0f172a',
                                        color: '#fff',
                                        borderRadius: '1rem',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }
                                });
                            } catch (e) {
                                toast.error('Failed to notify staff');
                            }
                        }}
                        disabled={requestedAttention}
                        className={`px-8 py-3 font-black text-xs uppercase tracking-widest rounded-2xl transition-all border-b-4 ${
                            requestedAttention 
                            ? 'bg-slate-800 text-slate-500 border-slate-900 cursor-not-allowed' 
                            : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-100 active:border-b-0 active:translate-y-1'
                        }`}
                    >
                        {requestedAttention ? 'NOTIFIED' : 'PAY AT TABLE'}
                    </button>
                )}
                {order.paymentStatus === 'PAID' && (
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <ShieldCheck size={24} className="text-green-500" />
                    </div>
                )}
            </div>
        </div>

        {/* Review Section */}
        {(isCompleted || order.paymentStatus === 'PAID') && !reviewSubmitted && (
            <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 animate-fade-in">
                <div className="text-center mb-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">HOW WAS YOUR MEAL?</h3>
                    <p className="text-[10px] text-slate-500 font-bold">Your feedback helps us perfect the DineSmart experience</p>
                </div>
                
                <div className="flex items-center justify-center gap-4 mb-10">
                    {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRating(s)} className="group/star">
                        <Star
                        size={40}
                        strokeWidth={s <= rating ? 0 : 2}
                        className={`transition-all duration-300 ${s <= rating ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'text-slate-700 group-hover/star:text-slate-500'}`}
                        />
                    </button>
                    ))}
                </div>

                <div className="space-y-4 mb-8 text-left border-t border-white/5 pt-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Rate Specific Items</p>
                    {order.items.map((item) => {
                      const currentItemRating = itemRatings[item.menuItem.name] || 0;
                      return (
                        <div key={item.id} className="flex items-center justify-between bg-black/20 rounded-2xl p-3 border border-white/5">
                            <span className="text-sm font-bold text-slate-300 truncate max-w-[60%]">{item.menuItem.name}</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => setItemRatings(prev => ({...prev, [item.menuItem.name]: s}))}
                                        className="p-1"
                                    >
                                        <Star size={16} strokeWidth={s <= currentItemRating ? 0 : 2} className={s <= currentItemRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                                    </button>
                                ))}
                            </div>
                        </div>
                      )
                    })}
                </div>
                
                <textarea
                    placeholder="Tell us what you liked..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-white/5 rounded-3xl p-5 text-sm font-bold text-white border border-white/10 focus:border-brand-500/50 focus:outline-none focus:bg-white/10 transition-all resize-none h-32 mb-6 placeholder:text-slate-600"
                />
                
                <button
                    onClick={handleSubmitReview}
                    disabled={rating === 0}
                    className="w-full bg-white text-slate-950 text-xs font-black uppercase tracking-[0.2em] py-5 rounded-[2rem] disabled:opacity-20 hover:bg-slate-200 transition-all active:scale-[0.98] shadow-xl shadow-white/5"
                >
                    SUBMIT FEEDBACK
                </button>
            </div>
        )}

        {reviewSubmitted && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-[2.5rem] p-10 text-center animate-fade-in-up">
                <div className="text-2xl mb-2">✨</div>
                <h3 className="text-sm font-black text-green-400 uppercase tracking-widest">Masterpiece Reviewed</h3>
                <p className="text-[10px] text-green-600 font-bold mt-1">YOUR INSIGHTS ARE VALUED.</p>
            </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => window.print()}
                className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-95"
            >
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <Printer size={20} className="text-slate-400" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">PRINT RECEIPT</span>
            </button>
            <Link 
                to={`/menu?restaurant=${order.restaurant.slug}&table=${order.table.number}`}
                className="p-6 bg-brand-500/10 border border-brand-500/20 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-brand-500/20 transition-all active:scale-95"
            >
                <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center">
                    <UtensilsCrossed size={20} className="text-brand-500" />
                </div>
                <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.15em]">ORDER MORE</span>
            </Link>
        </div>
      </main>

      {/* Premium Payment Gateway Modal */}
      {showPaymentGateway && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-fade-in" onClick={() => setShowPaymentGateway(false)} />
          <div className="relative w-full max-w-lg bg-slate-950 rounded-t-[3rem] p-10 animate-slide-up border-t border-white/10 shadow-[0_-20px_100px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-10" />
            
            <header className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-500/40">
                        <CreditCard size={28} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">DineSmart Pay</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SECURE TRANSACTION</p>
                    </div>
                </div>
                <button onClick={() => setShowPaymentGateway(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                    <X size={24} className="text-slate-400" />
                </button>
            </header>
            
            <div className="text-center mb-12 py-10 bg-white/[0.02] rounded-[2.5rem] border border-white/5 shadow-inner">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">TOTAL PAYABLE AMOUNT</p>
                <p className="text-6xl font-black text-white tracking-tighter">₹{order.total.toFixed(0)}</p>
            </div>

            <div className="space-y-4 mb-10">
                <button 
                  onClick={async () => {
                    setProcessingPayment(true);
                    try {
                      const res = await fetch(`/api/v1/orders/${order.id}/payment/initiate`, { method: 'POST' });
                      const text = await res.text();
                      let data;
                      try { data = JSON.parse(text); } catch { data = null; }
                      
                      if (data?.success && data.data?.stripeSessionUrl) {
                          // Securely redirect to Stripe Checkout
                          window.location.href = data.data.stripeSessionUrl;
                      } else {
                          throw new Error('Payment initialization failed');
                      }
                    } catch (e) {
                      toast.error('Transaction Interrupted. Please try again or pay at the desk.');
                    } finally {
                      setProcessingPayment(false);
                    }
                  }}
                  disabled={processingPayment}
                  className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-white text-slate-950 font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/5 disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <CreditCard size={20} />
                    <span>Pay with Stripe / Card</span>
                  </div>
                  <ChevronRight size={18} strokeWidth={3} />
                </button>
                
                <button 
                  disabled
                  className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-white/5 text-slate-600 font-bold text-xs uppercase tracking-widest cursor-not-allowed"
                >
                   <div className="flex items-center gap-4">
                    <CreditCard size={20} />
                    <span>Card (Coming Soon)</span>
                  </div>
                </button>
            </div>

            {processingPayment && (
              <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-10 animate-fade-in">
                <div className="w-20 h-20 border-4 border-slate-900 border-t-brand-500 rounded-full animate-spin mb-8" />
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Authenticating...</h3>
                <p className="text-sm text-slate-500 font-medium">Please do not refresh or close the browser.</p>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-3 py-6 grayscale opacity-30">
                <ShieldCheck size={16} />
                <span className="text-[9px] font-black uppercase tracking-widest">256-Bit Encrypted High-Security Gateway</span>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt for Printing (Professional Look) */}
      <div className="hidden print:block fixed inset-0 bg-white z-[200] p-12 text-black font-sans leading-relaxed">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">DineSmart</h1>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Official Digital Receipt</p>
          </div>

          <div className="flex justify-between items-start mb-10 pb-10 border-b-2 border-slate-100 border-dashed">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TRANSACTION ID</p>
                <p className="text-sm font-bold">DSMT-{order.id.slice(-8).toUpperCase()}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-1">{new Date(order.createdAt).toLocaleString().toUpperCase()}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TABLE</p>
                <p className="text-4xl font-black">#{order.table.number}</p>
            </div>
          </div>

          <div className="space-y-6 mb-12">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">ITEMIZED SELECTIONS</p>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <span className="text-sm font-black mr-3">{item.quantity}×</span>
                  <span className="text-sm font-bold text-slate-800">{item.menuItem.name.toUpperCase()}</span>
                </div>
                <span className="text-sm font-black">₹{item.totalPrice}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-10 border-t-2 border-slate-100 border-dashed">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>SUBTOTAL</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-xs font-black text-green-600">
                <span>EXCLUSIVE DISCOUNT</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>GST (5%)</span>
              <span>₹{order.tax.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center pt-6 mt-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">GRAND TOTAL</span>
              <span className="text-3xl font-black tracking-tighter text-slate-950">₹{order.total.toFixed(0)}</span>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-100 text-center">
            <div className="p-4 border-2 border-slate-100 inline-block rounded-3xl mb-8">
                {/* Fake QR for Receipt look */}
                <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center px-4">
                  VALID RECEIPT QR
                </div>
            </div>
            <p className="text-sm font-black uppercase tracking-widest mb-1">Thank You</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visit again for a premium experience</p>
            <p className="text-[9px] font-medium text-slate-300 mt-10 uppercase tracking-widest">Powered by DineSmart OS Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}

