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
      case 'ORDER_NEW': return <Utensils size={16} className="text-primary" />;
      case 'LOW_STOCK': return <AlertTriangle size={16} className="text-tertiary" />;
      case 'PAYMENT_RECEIVED': return <CheckCircle2 size={16} className="text-secondary" />;
      case 'PAYMENT_ATTENTION': return <Bell size={16} className="text-primary animate-bounce" />;
      default: return <Info size={16} className="text-outline" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest dark:bg-inverse-surface rounded-2xl shadow-2xl border border-outline-variant dark:border-outline z-50 overflow-hidden transform origin-top-right transition-all">
      <div className="p-4 border-b border-outline-variant dark:border-outline flex items-center justify-between bg-surface-container-lowest/50 dark:bg-inverse-surface/50">
        <div>
          <h3 className="font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
            <Bell size={16} className="text-primary" />
            Notifications
          </h3>
          <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider mt-0.5">
            {data?.unreadCount || 0} New messages
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-surface-container-high dark:hover:bg-outline-variant/20 rounded-lg transition-colors text-outline">
          <X size={16} />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-on-surface-variant">Syncing alerts...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-outline-variant dark:divide-outline">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 hover:bg-surface-container-low dark:hover:bg-inverse-surface/50 transition-colors relative group ${!n.isRead ? 'bg-primary/5' : ''}`}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    !n.isRead ? 'bg-surface-container-lowest dark:bg-inverse-surface shadow-sm' : 'bg-surface-container-low dark:bg-inverse-surface/50'
                  }`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={`text-sm tracking-tight truncate ${!n.isRead ? 'font-bold text-on-surface dark:text-inverse-on-surface' : 'text-on-surface-variant dark:text-outline'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-outline whitespace-nowrap">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {n.body}
                    </p>
                  </div>
                </div>
                {!n.isRead && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-surface-container-low dark:bg-inverse-surface rounded-2xl flex items-center justify-center mx-auto mb-4 text-outline-variant dark:text-outline">
              <Bell size={24} />
            </div>
            <p className="text-sm font-bold text-on-surface dark:text-inverse-on-surface">All caught up!</p>
            <p className="text-xs text-on-surface-variant mt-1">No new notifications at the moment.</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-outline-variant dark:border-outline bg-surface-container-lowest/50 dark:bg-inverse-surface/50 text-center">
          <button className="text-[11px] font-black text-primary uppercase tracking-widest hover:text-primary-container transition-colors">
            View All History
          </button>
        </div>
      )}
    </div>
  );
}
