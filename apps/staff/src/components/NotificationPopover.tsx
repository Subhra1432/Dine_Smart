import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2, Info, AlertTriangle, Utensils, X } from 'lucide-react';
import { getNotifications, markNotificationRead } from '../lib/api';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'ORDER_NEW' | 'ORDER_STATUS' | 'PAYMENT_RECEIVED' | 'LOW_STOCK' | 'REVIEW_NEW' | 'PAYMENT_ATTENTION';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

interface Props {
  onClose: () => void;
}

export function NotificationPopover({ onClose }: Props) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ notifications: Notification[], unreadCount: number }>({
    queryKey: ['notifications'],
    queryFn: () => getNotifications() as any,
  });

  const notifications = data?.notifications || [];

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER_NEW': return <Utensils size={16} className="text-brand-500" />;
      case 'LOW_STOCK': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'PAYMENT_RECEIVED': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'PAYMENT_ATTENTION': return <Bell size={16} className="text-brand-500 animate-bounce" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden transform origin-top-right transition-all">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={16} className="text-brand-500" />
            Notifications
          </h3>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
            {data?.unreadCount || 0} New messages
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400">
          <X size={16} />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Syncing alerts...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative group ${!n.isRead ? 'bg-brand-500/5' : ''}`}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    !n.isRead ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-100 dark:bg-slate-800/50'
                  }`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={`text-sm tracking-tight truncate ${!n.isRead ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {n.body}
                    </p>
                  </div>
                </div>
                {!n.isRead && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-500 rounded-full" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
              <Bell size={24} />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">No new notifications at the moment.</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-center">
          <button className="text-[11px] font-black text-brand-500 uppercase tracking-widest hover:text-brand-600 transition-colors">
            View All History
          </button>
        </div>
      )}
    </div>
  );
}
