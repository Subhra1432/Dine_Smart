// ═══════════════════════════════════════════
// DineSmart — Subscription & Plan Page
// ═══════════════════════════════════════════

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/auth';
import {
  CreditCard, Crown, Zap, Rocket, Check,
  AlertTriangle, IndianRupee, Calendar, Shield
} from 'lucide-react';

const API_BASE = '/api/v1';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'API request failed');
  return data.data as T;
}

interface SubscriptionInfo {
  plan: string;
  planExpiresAt: string | null;
  isActive: boolean;
  daysRemaining: number;
  usage: {
    branches: number;
    tables: number;
    menuItems: number;
    orders: number;
  };
}

const PLANS = [
  {
    name: 'STARTER',
    label: 'Starter',
    price: 999,
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    features: [
      '1 Branch',
      '10 Tables',
      'Basic Analytics',
      'Email Support',
      'QR Code Ordering',
      'Kitchen Display',
    ],
    limits: { branches: 1, tables: 10 },
  },
  {
    name: 'GROWTH',
    label: 'Growth',
    price: 2499,
    icon: Rocket,
    color: 'from-brand-500 to-purple-500',
    popular: true,
    features: [
      '3 Branches',
      '50 Tables',
      'Full Analytics',
      'AI Recommendations',
      'Priority Support',
      'Coupon System',
      'Loyalty Program',
    ],
    limits: { branches: 3, tables: 50 },
  },
  {
    name: 'PREMIUM',
    label: 'Premium',
    price: 7499,
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    features: [
      'Unlimited Branches',
      'Unlimited Tables',
      'Full Analytics',
      'AI Features',
      'White Label',
      '24/7 Phone Support',
      'Custom Integrations',
      'Dedicated Account Manager',
    ],
    limits: { branches: -1, tables: -1 },
  },
];

export default function SubscriptionPage() {
  const { restaurant, user, setAuth } = useAuthStore();
  const isOwner = user?.role === 'OWNER';
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: subscription, isLoading } = useQuery<SubscriptionInfo>({
    queryKey: ['subscription'],
    queryFn: () => fetchApi<SubscriptionInfo>('/restaurant/subscription'),
  });

  const currentPlan = PLANS.find(p => p.name === (subscription?.plan || restaurant?.plan));
  const isExpired = subscription?.daysRemaining !== undefined && subscription.daysRemaining <= 0;
  const isExpiringSoon = subscription?.daysRemaining !== undefined && subscription.daysRemaining > 0 && subscription.daysRemaining <= 7;

  const { data: payments } = useQuery<any[]>({
    queryKey: ['subscriptionPayments'],
    queryFn: () => fetchApi<any[]>('/restaurant/subscription/payments'),
  });

  const handleSubscribe = async (planName: string) => {
    setSelectedPlan(planName);
    setShowPaymentModal(true);
  };

  const handlePayment = async (method: string) => {
    if (!selectedPlan) return;
    setProcessing(true);
    try {
      const data = await fetchApi<any>('/restaurant/subscription/pay', {
        method: 'POST',
        body: JSON.stringify({ plan: selectedPlan, paymentMethod: method }),
      });
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.success('Subscription activated successfully!');
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
        queryClient.invalidateQueries({ queryKey: ['subscriptionPayments'] });
        setShowPaymentModal(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const selectedPlanInfo = PLANS.find(p => p.name === selectedPlan);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription & Billing</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your DineSmart subscription plan</p>
      </div>

      {/* Expiry Warning */}
      {(isExpired || isExpiringSoon) && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
          isExpired
            ? 'bg-red-500/10 border-red-500/20'
            : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          <AlertTriangle size={20} className={isExpired ? 'text-red-400 mt-0.5' : 'text-amber-400 mt-0.5'} />
          <div>
            <p className={`text-sm font-bold ${isExpired ? 'text-red-400' : 'text-amber-400'}`}>
              {isExpired ? 'Subscription Expired!' : 'Subscription Expiring Soon!'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {isExpired
                ? 'Your subscription has expired. Please renew to continue using all features. Your data is safe but customers cannot place orders.'
                : `Your subscription expires in ${subscription?.daysRemaining} day${subscription?.daysRemaining === 1 ? '' : 's'}. Renew now to avoid service interruption.`
              }
            </p>
          </div>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Current Plan</p>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentPlan?.color || 'from-blue-500 to-cyan-500'} flex items-center justify-center`}>
                {currentPlan?.icon && <currentPlan.icon size={24} className="text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentPlan?.label || restaurant?.plan}</h2>
                <p className="text-sm text-slate-500">₹{currentPlan?.price.toLocaleString()}/month</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isExpired
                  ? 'bg-red-500/20 text-red-400'
                  : isExpiringSoon
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING SOON' : 'ACTIVE'}
              </span>
            </div>
            {subscription?.planExpiresAt && (
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 justify-end">
                <Calendar size={12} />
                Expires: {new Date(subscription.planExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        {subscription?.usage && (
          <div className="grid grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/50">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{subscription.usage.branches}</p>
              <p className="text-[10px] text-slate-500">Branches</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{subscription.usage.tables}</p>
              <p className="text-[10px] text-slate-500">Tables</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{subscription.usage.menuItems}</p>
              <p className="text-[10px] text-slate-500">Menu Items</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{subscription.usage.orders}</p>
              <p className="text-[10px] text-slate-500">Total Orders</p>
            </div>
          </div>
        )}
      </div>

      {/* Renew Current Plan */}
      {currentPlan && (isExpired || isExpiringSoon) && (
        <button
          onClick={() => handleSubscribe(currentPlan.name)}
          className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-2xl text-lg shadow-lg shadow-brand-500/20 hover:from-brand-600 hover:to-brand-700 transition-all active:scale-[0.99]"
        >
          <IndianRupee size={20} className="inline mr-1 mb-0.5" />
          Renew {currentPlan.label} — ₹{currentPlan.price.toLocaleString()}/month
        </button>
      )}

      {/* Plan Cards */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          {isExpired || isExpiringSoon ? 'Or Choose a Different Plan' : 'Available Plans'}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.name === (subscription?.plan || restaurant?.plan);
            return (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-slate-800/50 rounded-2xl p-5 border transition-all ${
                  isCurrent
                    ? 'border-brand-500/40 shadow-lg shadow-brand-500/10'
                    : 'border-slate-200 dark:border-slate-700/50 hover:border-brand-500/20'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full uppercase">
                    Most Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-2.5 right-4 px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase">
                    Current
                  </span>
                )}

                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                  <plan.icon size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.label}</h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  ₹{plan.price.toLocaleString()}<span className="text-sm font-normal text-slate-500">/mo</span>
                </p>

                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Check size={12} className="text-emerald-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={isCurrent && !isExpired && !isExpiringSoon}
                  className={`w-full mt-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isCurrent && !isExpired && !isExpiringSoon
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${plan.color} text-white hover:opacity-90 active:scale-[0.98] shadow-md`
                  }`}
                >
                  {isCurrent && !isExpired && !isExpiringSoon
                    ? 'Current Plan'
                    : isCurrent
                      ? 'Renew Plan'
                      : `Upgrade to ${plan.label}`
                  }
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <CreditCard size={14} /> PAYMENT HISTORY
        </h2>
        {!payments?.length ? (
            subscription?.plan !== 'STARTER' ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <Check size={16} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{subscription?.plan} Plan Activated</p>
                                <p className="text-xs text-slate-500">System generated from active status</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-emerald-500">Active</p>
                            <p className="text-xs text-slate-500">Ongoing</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6">
                  <Shield size={32} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Payment history will appear here after your first transaction</p>
                  <p className="text-xs text-slate-400 mt-1">All payments are securely processed</p>
                </div>
            )
        ) : (
            <div className="space-y-3">
               {payments.map((p: any) => (
                 <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Check size={16} className="text-emerald-500" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white">{p.plan} Plan Upgrade</p>
                           <p className="text-xs text-slate-500">{p.method}</p>
                        </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-emerald-500">{p.status}</p>
                       <p className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                 </div>
               ))}
            </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlanInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Complete Payment</h3>
            <p className="text-sm text-slate-500 mb-6">
              Subscribe to <span className="font-bold text-brand-400">{selectedPlanInfo.label}</span> plan
            </p>

            {/* Plan Summary */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Plan</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedPlanInfo.label}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Duration</span>
                <span className="text-sm text-slate-900 dark:text-white">30 days</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">GST (18%)</span>
                <span className="text-sm text-slate-900 dark:text-white">₹{Math.round(selectedPlanInfo.price * 0.18).toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Total</span>
                <span className="text-lg font-bold text-brand-500">₹{Math.round(selectedPlanInfo.price * 1.18).toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <p className="text-xs text-slate-500 font-semibold uppercase mb-3">Select Payment Method</p>
            <div className="space-y-2 mb-6">
              <button
                onClick={() => handlePayment('UPI')}
                disabled={processing}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-colors disabled:opacity-50"
              >
                <span className="text-2xl">📱</span>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">UPI / Google Pay / PhonePe</p>
                  <p className="text-[10px] text-slate-500">Instant payment via UPI</p>
                </div>
              </button>
              <button
                onClick={() => handlePayment('CARD')}
                disabled={processing}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-colors disabled:opacity-50"
              >
                <span className="text-2xl">💳</span>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Credit / Debit Card</p>
                  <p className="text-[10px] text-slate-500">Visa, Mastercard, RuPay</p>
                </div>
              </button>
              <button
                onClick={() => handlePayment('BANK_TRANSFER')}
                disabled={processing}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-colors disabled:opacity-50"
              >
                <span className="text-2xl">🏦</span>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Net Banking</p>
                  <p className="text-[10px] text-slate-500">Bank transfer (NEFT/IMPS)</p>
                </div>
              </button>
            </div>

            {processing && (
              <div className="text-center mb-4">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Processing payment...</p>
              </div>
            )}

            <button
              onClick={() => { setShowPaymentModal(false); setSelectedPlan(null); }}
              disabled={processing}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>

            <p className="text-[10px] text-slate-400 text-center mt-3">
              🔒 Payments are securely processed. By subscribing you agree to our Terms of Service.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
