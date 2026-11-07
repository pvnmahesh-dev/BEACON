import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, Sparkles, Check, CheckCheck, Trash2 } from 'lucide-react';
import { AppNotification } from '../../types';
import { mockNotifications } from '../../data/mockData';
import { useToast } from '../ui/Toast';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScholarshipDetails?: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { showToast } = useToast();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  const clearAll = () => {
    setNotifications([]);
    showToast('Notifications cleared', 'info');
  };

  const displayedNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-[17px] bg-white border-[2.5px] border-[#252b3a] shadow-[6px_6px_0px_#252b3a] overflow-hidden z-50 text-[#253044]">
        {/* Header */}
        <div className="p-4 border-b-2 border-[#252b3a] bg-[#fffdf5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-[10px] bg-[#6434df] text-white border-2 border-[#252b3a] shadow-[1.5px_1.5px_0px_#252b3a]">
              <Bell className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-heading font-extrabold text-sm text-[#253044]">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-[#ff78c5] text-[#253044] border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a]">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-[#253044] font-heading font-bold hover:bg-[#f1ebff] flex items-center gap-1 px-2.5 py-1 rounded-[8px] border border-[#252b3a] transition-all cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-[11px] text-[#253044]/70 hover:text-red-600 p-1 rounded-[8px] hover:bg-red-50 transition-colors cursor-pointer"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b-2 border-[#252b3a] bg-white flex items-center gap-2 text-xs font-heading font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-[10px] transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#6434df] text-white border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a]'
                : 'text-[#253044] hover:bg-[#fffdf5] border-2 border-transparent'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-[10px] transition-all cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#ffd05b] text-[#253044] border-2 border-[#252b3a] shadow-[2px_2px_0px_#252b3a]'
                : 'text-[#253044] hover:bg-[#fffdf5] border-2 border-transparent'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y-2 divide-[#252b3a]/10 bg-white">
          {displayedNotifications.length === 0 ? (
            <div className="p-8 text-center text-[#253044]/60 text-xs flex flex-col items-center justify-center gap-2 font-medium">
              <Check className="w-8 h-8 text-[#9bf1cd]" />
              <p>No new notifications right now.</p>
            </div>
          ) : (
            displayedNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-3.5 hover:bg-[#fffdf5] transition-colors flex items-start gap-3 cursor-pointer ${
                  !notif.read ? 'bg-[#f1ebff]/50' : ''
                }`}
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                  );
                }}
              >
                <div
                  className={`mt-0.5 p-1.5 rounded-[8px] border-2 border-[#252b3a] shadow-[1px_1px_0px_#252b3a] shrink-0 ${
                    notif.type === 'deadline'
                      ? 'bg-[#ffd05b] text-[#253044]'
                      : notif.type === 'match'
                      ? 'bg-[#9bf1cd] text-[#253044]'
                      : notif.type === 'status'
                      ? 'bg-[#ff78c5] text-[#253044]'
                      : 'bg-[#6434df] text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="font-heading font-extrabold text-xs text-[#253044] truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-[#253044]/60 font-mono font-semibold shrink-0 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[#596174] font-medium leading-relaxed">
                    {notif.description}
                  </p>
                </div>

                {!notif.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff78c5] border border-[#252b3a] shrink-0 mt-1.5" />
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
