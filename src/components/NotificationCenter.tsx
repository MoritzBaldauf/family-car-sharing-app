import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, CheckCheck, Clock, CheckCircle2, Car, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    claimFreedSlot,
    waitingList
  } = useApp();

  if (!isOpen) return null;

  // Filter notifications relevant to current user or all
  const userNotifs = notifications.filter(
    n => n.recipientUserId === currentUser.id || n.recipientUserId === 'all'
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'waiting_list_joined':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'slot_freed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'car_returned':
        return <Car className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Activity & Alerts</h3>
              <p className="text-xs text-slate-400">{userNotifs.length} updates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userNotifs.length > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 font-medium transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {userNotifs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
              <p className="text-sm font-medium">No alerts right now</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Waiting list updates and booking changes will appear here.
              </p>
            </div>
          ) : (
            userNotifs.map(notif => {
              // Check if this notification corresponds to a waiting list item that can be claimed
              const matchWaitlist = waitingList.find(
                w => w.date === notif.date && w.userId === currentUser.id && w.status === 'offered'
              );

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-3 rounded-2xl border transition-all ${
                    notif.read
                      ? 'bg-slate-800/40 border-slate-800 text-slate-300'
                      : 'bg-slate-800/90 border-indigo-500/40 text-slate-100 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-700/50 shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {format(new Date(notif.createdAt), 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* 1-Tap Claim Slot Action if slot freed */}
                      {matchWaitlist && (
                        <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              claimFreedSlot(matchWaitlist.id);
                              markNotificationAsRead(notif.id);
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition-all active:scale-95"
                          >
                            Claim this Car Slot
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
