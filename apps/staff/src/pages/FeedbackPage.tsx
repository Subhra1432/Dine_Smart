// ═══════════════════════════════════════════
// DineSmart — Feedback Page
// ═══════════════════════════════════════════

import { useQuery } from '@tanstack/react-query';
import { Star, MessageSquare } from 'lucide-react';
import { getReviews } from '../lib/api';

export default function FeedbackPage() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => getReviews() as Promise<Array<any>>,
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const averageRating = reviews?.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="p-8 h-full overflow-y-auto bg-surface-container-lowest dark:bg-inverse-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-on-surface dark:text-inverse-on-surface tracking-tight">Customer Feedback</h1>
          <p className="text-on-surface-variant dark:text-outline mt-1">Review ratings and feedback from your diners</p>
        </div>
        
        <div className="flex items-center gap-4 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline p-4 rounded-2xl shadow-sm">
           <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Star className="text-amber-500 fill-amber-500" size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-outline uppercase tracking-widest">Average Rating</p>
              <div className="flex items-end gap-1">
                 <p className="text-2xl font-bold text-on-surface dark:text-inverse-on-surface leading-none">{averageRating}</p>
                 <p className="text-sm text-on-surface-variant font-bold mb-0.5">/ 5.0</p>
              </div>
           </div>
        </div>
      </div>

      {reviews?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-surface-container-low dark:bg-inverse-surface rounded-full flex items-center justify-center mb-6">
            <MessageSquare size={32} className="text-outline" />
          </div>
          <h2 className="text-xl font-bold text-on-surface dark:text-inverse-on-surface mb-2">No feedback yet</h2>
          <p className="text-on-surface-variant max-w-sm">When customers leave reviews and ratings, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews?.map((review) => (
            <div key={review.id} className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline p-6 rounded-[2rem] hover:border-primary/30 transition-colors shadow-sm">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <div className="flex">
                       {[...Array(5)].map((_, i) => (
                           <Star key={i} size={16} className={i < review.rating ? "text-amber-500 fill-amber-500" : "text-surface-container-highest dark:text-on-surface-variant"} />
                       ))}
                    </div>
                    <span className="text-sm font-bold text-on-surface-variant dark:text-outline ml-2">{review.rating}.0</span>
                 </div>
                 <span className="text-xs text-outline">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              
              {review.comment && (
                 <p className="text-on-surface-variant dark:text-inverse-on-surface text-sm mb-4 italic">"{review.comment}"</p>
              )}
              
              <div className="pt-4 border-t border-outline-variant dark:border-outline/50 mt-auto">
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Customer</p>
                       <p className="text-sm font-bold text-on-surface dark:text-inverse-on-surface">{review.order.customer?.name || review.order.customer?.phone || 'Guest'}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Order</p>
                       <p className="text-sm font-bold text-primary">#{review.order.id.slice(-6)} (Table {review.order.table.number})</p>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
