import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCheck,
  Clock,
  CheckCircle2,
  Car,
  Sparkles,
  UserCheck,
  Calendar as CalendarIcon,
  MessageCircle,
  Trash2,
  ArrowRight,
  HandMetal
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { triggerHaptic } from '../lib/haptics';

interface AlertsViewProps {
  onNavigateToDate?: (dateStr: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onNavigateToDate }) => {
  const {
    currentUser,
    bookings,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    claimFreedSlot,
    leaveWaitingList,
    handoverBookingToWaitingUser,
    navigateToCalendarDate,
    waitingList,
    t,
    dateLocale
  } = useApp();

  const handleJumpToDay = (dateStr: string) => {
    triggerHaptic('light');
    if (onNavigateToDate) {
      onNavigateToDate(dateStr);
    }
    navigateToCalendarDate(dateStr);
  };

  const userNotifs = notifications.filter(
    n => n.recipientUserId === currentUser.id || n.recipientUserId === 'all'
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'waiting_list_joined':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'slot_freed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'car_returned':
        return <Car className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {t.activityAlerts}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t.totalUpdates(userNotifs.length)}
          </p>
        </div>

        {userNotifs.some(n => !n.read) && (
          <button
            onClick={markAllNotificationsAsRead}
            className="text-xs text-[#0071e3] dark:text-[#0a84ff] hover:underline flex items-center gap-1 font-semibold active-press cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{t.markAllRead}</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {userNotifs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-8 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.allCaughtUp}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
              {t.allCaughtUpSub}
            </p>
          </div>
        ) : (
          userNotifs.map(notif => {
            const matchWaitlist = waitingList.find(
              w => w.date === notif.date && w.userId === currentUser.id && w.status === 'offered'
            );

            return (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300'
                    : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                        {format(new Date(notif.createdAt), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* 1-Tap Claim Slot Action if slot freed */}
                    {/* Notification Action Bar */}
                    <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      {notif.date && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(notif.id);
                            handleJumpToDay(notif.date);
                          }}
                          className="text-[11px] font-semibold text-[#0071e3] dark:text-[#0a84ff] flex items-center gap-1 hover:underline active-press cursor-pointer"
                        >
                          <CalendarIcon className="w-3 h-3" />
                          <span>{t.jumpToCalendarDay}</span>
                        </button>
                      )}

                      {matchWaitlist && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic('success');
                            claimFreedSlot(matchWaitlist.id);
                            markNotificationAsRead(notif.id);
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition-all active-press cursor-pointer"
                        >
                          {t.claimCarSlot}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ACTIVE FAMILY WAITING LIST OVERVIEW */}
      {waitingList.filter(w => w.status === 'waiting' || w.status === 'offered').length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
              <span>
                {t.activeFamilyWaitlist} ({waitingList.filter(w => w.status === 'waiting' || w.status === 'offered').length})
              </span>
            </h3>
          </div>

          <div className="space-y-3">
            {waitingList
              .filter(w => w.status === 'waiting' || w.status === 'offered')
              .map(item => {
                const isCurrentUserWaiting = item.userId === currentUser.id;
                const isOffered = item.status === 'offered';

                // Find target booking that currently blocks or previously blocked this slot
                const targetBooking = bookings.find(
                  b => (b.id === item.bookingId || b.startDate === item.date) && b.status === 'confirmed'
                );

                const isCurrentCarHolder = targetBooking?.userId === currentUser.id;

                // Compute queue position
                const slotQueue = waitingList
                  .filter(
                    w =>
                      (w.status === 'waiting' || w.status === 'offered') &&
                      ((w.bookingId && w.bookingId === item.bookingId) ||
                        (w.date === item.date && w.slotType === item.slotType))
                  )
                  .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
                const queueIndex = slotQueue.findIndex(w => w.id === item.id);
                const queuePosition = queueIndex >= 0 ? queueIndex + 1 : 1;

                // Localized formatted date
                let formattedDate = item.date;
                try {
                  formattedDate = format(parseISO(item.date), 'EEEE, d. MMMM', { locale: dateLocale });
                } catch {
                  formattedDate = item.date;
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => handleJumpToDay(item.date)}
                    className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4 transition-all shadow-2xs hover:shadow-sm cursor-pointer active-press ${
                      isOffered
                        ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : isCurrentUserWaiting
                        ? 'border-blue-200 dark:border-blue-800/60 bg-blue-50/20 dark:bg-blue-950/10'
                        : 'border-zinc-200/80 dark:border-zinc-800/80'
                    }`}
                  >
                    {/* Top Bar: Waiting Member & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white dark:ring-zinc-900"
                          style={{ backgroundColor: item.userColor }}
                        />
                        <div className="min-w-0 truncate">
                          <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                            {item.userName}
                          </span>
                          {isCurrentUserWaiting && (
                            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-[#0071e3] dark:text-[#0a84ff]">
                              {t.activeProfile}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 ${
                          isOffered
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20'
                            : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/20'
                        }`}
                      >
                        {isOffered ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>{t.statusOffered}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>{t.queuePosition(queuePosition)}</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Mid Row: Date and Slot Information */}
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-semibold">
                        <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{formattedDate}</span>
                      </div>
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md">
                        {item.slotType}
                      </span>
                    </div>

                    {/* Target Booking Info (Who currently has the car reserved) */}
                    {targetBooking && (
                      <div className="mt-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800/50 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <Car className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">
                            {t.currentlyBookedBy(targetBooking.userName)}
                            {targetBooking.destinationNote && ` (${targetBooking.destinationNote})`}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons Toolbar */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      {/* View in Calendar Shortcut */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJumpToDay(item.date);
                        }}
                        className="text-xs font-semibold text-[#0071e3] dark:text-[#0a84ff] flex items-center gap-1 hover:underline active-press cursor-pointer"
                      >
                        <span>{t.jumpToCalendarDay}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        {/* WhatsApp Friendly Nudge */}
                        {isCurrentUserWaiting && targetBooking && !isCurrentCarHolder && !isOffered && (
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              t.whatsAppNudgeText(targetBooking.userName, item.date, item.slotType)
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic('light');
                            }}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 active-press"
                            title={t.whatsAppNudge}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{t.whatsAppNudge}</span>
                          </a>
                        )}

                        {/* 1-Tap Handover Button (For Current Booking Owner) */}
                        {isCurrentCarHolder && targetBooking && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(t.handoverConfirm(item.userName, item.date))) {
                                handoverBookingToWaitingUser(targetBooking.id, item.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 active-press cursor-pointer shadow-xs"
                          >
                            <HandMetal className="w-3.5 h-3.5" />
                            <span>{t.handoverBookingBtn(item.userName)}</span>
                          </button>
                        )}

                        {/* 1-Tap Claim Slot Button (If Offered) */}
                        {isOffered && isCurrentUserWaiting && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic('success');
                              claimFreedSlot(item.id);
                            }}
                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs active-press cursor-pointer shadow-xs"
                          >
                            {t.claimCarSlot}
                          </button>
                        )}

                        {/* Leave Waiting List (If Current User Waiting) */}
                        {isCurrentUserWaiting && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(t.leaveWaitlistConfirm)) {
                                leaveWaitingList(item.id);
                              }
                            }}
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors active-press cursor-pointer"
                            title={t.leaveWaitlist}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
