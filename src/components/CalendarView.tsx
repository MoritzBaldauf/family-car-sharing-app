import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, addDays, isSameDay, isToday, parseISO, differenceInCalendarDays, startOfToday } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
  Share2,
  HandMetal,
  MessageCircle
} from 'lucide-react';
import type { Booking, BookingSlotType } from '../types';
import { VisualDayTimeline } from './VisualDayTimeline';
import { triggerHaptic } from '../lib/haptics';

interface CalendarViewProps {
  onOpenBookingModal: (selectedDate: string, defaultSlot?: BookingSlotType) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenBookingModal }) => {
  const {
    currentUser,
    bookings,
    waitingList,
    cancelBooking,
    claimFreedSlot,
    leaveWaitingList,
    handoverBookingToWaitingUser,
    targetCalendarDate,
    clearTargetCalendarDate,
    t,
    dateLocale
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dayOffset, setDayOffset] = useState<number>(0);
  const stripRef = useRef<HTMLDivElement>(null);

  // Synchronize target date if navigated from another screen (e.g. Alerts tab or Waitlist notification)
  useEffect(() => {
    if (targetCalendarDate) {
      try {
        const target = parseISO(targetCalendarDate);
        setSelectedDate(target);

        const diff = differenceInCalendarDays(target, startOfToday());
        // If outside current 14-day strip window
        if (diff < dayOffset || diff >= dayOffset + 14) {
          const newOffset = Math.floor(diff / 7) * 7;
          setDayOffset(newOffset);
        }

        // Auto-scroll strip to view
        setTimeout(() => {
          const dayButton = document.getElementById(`day-pill-${targetCalendarDate}`);
          if (dayButton) {
            dayButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }, 120);
      } catch (err) {
        console.error('Failed to navigate to target date:', err);
      }
      clearTargetCalendarDate();
    }
  }, [targetCalendarDate, dayOffset, clearTargetCalendarDate]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  // Generate 14-day strip window
  const stripStartDate = addDays(new Date(), dayOffset);
  const daysStrip = Array.from({ length: 14 }, (_, i) => addDays(stripStartDate, i));

  // Filter bookings for the currently selected date
  const dayBookings = bookings.filter(
    b => b.startDate === selectedDateStr && b.status === 'confirmed'
  );

  // Filter waiting list for the currently selected date
  const dayWaitingList = waitingList.filter(
    w => w.date === selectedDateStr && (w.status === 'waiting' || w.status === 'offered')
  );

  // User's active waiting list entries across all days
  const myActiveWaitlists = waitingList.filter(
    w => w.userId === currentUser.id && (w.status === 'waiting' || w.status === 'offered')
  );

  const handlePrevDays = () => {
    triggerHaptic('light');
    setDayOffset(prev => Math.max(prev - 7, -7));
  };
  const handleNextDays = () => {
    triggerHaptic('light');
    setDayOffset(prev => prev + 7);
  };
  const handleJumpToday = () => {
    triggerHaptic('light');
    setDayOffset(0);
    setSelectedDate(new Date());
    stripRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const getSlotLabel = (booking: Booking) => {
    switch (booking.slotType) {
      case 'full-day':
        return `${t.slotFullDay} (${t.slotFullDaySub})`;
      case 'morning':
        return `${t.slotMorning} (${booking.startTime || '08:00'} - ${booking.endTime || '13:00'})`;
      case 'afternoon':
        return `${t.slotAfternoon} (${booking.startTime || '13:00'} - ${booking.endTime || '18:00'})`;
      case 'evening':
        return `${t.slotEvening} (${booking.startTime || '18:00'} - ${booking.endTime || '23:00'})`;
      case 'custom':
        return `${t.slotCustom} (${booking.startTime} - ${booking.endTime})`;
      default:
        return 'Reserved';
    }
  };

  return (
    <div className="space-y-4">
      {/* Meine Wartelisten Quick Jump Banner */}
      {myActiveWaitlists.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t.myWaitlistBanner(myActiveWaitlists.length)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {myActiveWaitlists.map(item => {
              const isSelected = item.date === selectedDateStr;
              let chipLabel = item.date;
              try {
                chipLabel = format(parseISO(item.date), 'EEE, d. MMM', { locale: dateLocale });
              } catch {
                chipLabel = item.date;
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    triggerHaptic('light');
                    try {
                      const target = parseISO(item.date);
                      setSelectedDate(target);
                      const diff = differenceInCalendarDays(target, startOfToday());
                      if (diff < dayOffset || diff >= dayOffset + 14) {
                        setDayOffset(Math.floor(diff / 7) * 7);
                      }
                      setTimeout(() => {
                        const el = document.getElementById(`day-pill-${item.date}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      }, 100);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all active-press flex items-center gap-1.5 cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white/90 dark:bg-zinc-800/90 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/80 hover:bg-white dark:hover:bg-zinc-800 shadow-2xs'
                  }`}
                >
                  <span>{chipLabel}</span>
                  <span className="text-[10px] opacity-75 font-normal">({item.slotType})</span>
                  {item.status === 'offered' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Date Strip Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight capitalize">
            {format(selectedDate, 'MMMM yyyy', { locale: dateLocale })}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleJumpToday}
            className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300/70 dark:hover:bg-zinc-700 border border-zinc-300/60 dark:border-zinc-700 transition-colors active-press cursor-pointer"
          >
            {t.today}
          </button>
          <button
            onClick={handlePrevDays}
            className="p-1.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300/70 dark:hover:bg-zinc-700 border border-zinc-300/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors active-press cursor-pointer"
            title={t.prevDays}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextDays}
            className="p-1.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300/70 dark:hover:bg-zinc-700 border border-zinc-300/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors active-press cursor-pointer"
            title={t.nextDays}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 14-Day Date Strip */}
      <div ref={stripRef} className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 snap-x">
        {daysStrip.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          const dayConfBookings = bookings.filter(
            b => b.startDate === dayStr && b.status === 'confirmed'
          );
          const hasWaitlist = waitingList.some(
            w => w.date === dayStr && (w.status === 'waiting' || w.status === 'offered')
          );
          const hasMyWaitlist = waitingList.some(
            w => w.date === dayStr && w.userId === currentUser.id && (w.status === 'waiting' || w.status === 'offered')
          );

          return (
            <button
              key={dayStr}
              id={`day-pill-${dayStr}`}
              onClick={() => {
                triggerHaptic('light');
                setSelectedDate(day);
              }}
              className={`snap-start flex flex-col items-center min-w-[58px] py-2.5 px-1.5 rounded-2xl border transition-all duration-150 relative cursor-pointer ${
                isSelected
                  ? 'bg-[#0071e3] dark:bg-[#0a84ff] border-[#0071e3] dark:border-[#0a84ff] text-white shadow-md shadow-blue-500/25 scale-[1.03]'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs'
              }`}
            >
              {/* Today indicator pip */}
              {isCurrentDay && !isSelected && (
                <span className="absolute -top-1 w-2 h-2 rounded-full bg-[#0071e3] dark:bg-[#0a84ff]" />
              )}

              {/* My Waitlist badge pip */}
              {hasMyWaitlist && (
                <span
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center text-[8px] text-white font-bold"
                  title="My Waiting List"
                >
                  ⏳
                </span>
              )}

              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isSelected ? 'text-blue-100' : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                {format(day, 'EEE', { locale: dateLocale })}
              </span>
              <span
                className={`text-base font-bold my-0.5 ${
                  isSelected ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                {format(day, 'd')}
              </span>

              {/* Booking Dots */}
              <div className="flex items-center gap-1 h-2 mt-0.5">
                {dayConfBookings.length === 0 ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-emerald-300' : 'bg-emerald-500/80'
                    }`}
                    title={t.freeAllDay}
                  />
                ) : (
                  dayConfBookings.slice(0, 2).map((b, idx) => (
                    <span
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: b.userColor }}
                      title={`${b.userName}: ${b.slotType}`}
                    />
                  ))
                )}
                {hasWaitlist && !hasMyWaitlist && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
                    title="Waiting list active"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Bar & Primary Book Action */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 capitalize">
            <span>{format(selectedDate, 'EEEE, d. MMMM', { locale: dateLocale })}</span>
            {isToday(selectedDate) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] dark:text-[#0a84ff] border border-blue-200 dark:border-blue-800/60">
                {t.today}
              </span>
            )}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {dayBookings.length === 0
              ? t.carAvailableAllDay
              : t.confirmedReservations(dayBookings.length)}
          </p>
        </div>

        <button
          onClick={() => onOpenBookingModal(selectedDateStr)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#0a84ff] dark:hover:bg-[#409cff] text-white text-xs font-bold shadow-sm shadow-blue-600/20 transition-all active-press cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.bookCar}</span>
        </button>
      </div>

      {/* 24-Hour Visual Availability Timeline */}
      <VisualDayTimeline
        dateStr={selectedDateStr}
        isToday={isToday(selectedDate)}
        bookings={dayBookings}
        onOpenBookingModal={onOpenBookingModal}
      />

      {/* Day Schedule Content */}
      <div className="space-y-3 pt-1">
        {dayBookings.length === 0 ? (
          /* Empty Day Card */
          <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-6 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-200/60 dark:border-emerald-800/50">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.carFreeAllDay}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
              {t.carFreeDescription}
            </p>
            <button
              onClick={() => onOpenBookingModal(selectedDateStr)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[#0071e3] dark:text-[#0a84ff] text-xs font-bold border border-zinc-200 dark:border-zinc-700 transition-colors active-press"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.reserveDay}</span>
            </button>
          </div>
        ) : (
          /* Bookings List for this Day */
          dayBookings.map(booking => {
            const isUserBooking = booking.userId === currentUser.id;
            const canCancel = isUserBooking || currentUser.role === 'admin';

            const waitingForBooking = dayWaitingList.filter(
              w => w.bookingId === booking.id && w.status === 'waiting'
            );

            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-colors"
              >
                {/* User color accent bar on left */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: booking.userColor }}
                />

                <div className="flex items-start justify-between gap-3">
                  {/* Driver and Slot info */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: booking.userColor }}
                    >
                      {booking.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {booking.userName}
                        </h4>
                        {isUserBooking && (
                          <span className="text-[10px] font-semibold text-[#0071e3] dark:text-[#0a84ff] bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/50">
                            {t.you}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {getSlotLabel(booking)}
                      </span>
                    </div>
                  </div>

                  {/* Actions: WhatsApp Share + Cancel */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        const dateFormatted = format(new Date(booking.startDate + 'T00:00:00'), 'EEE, d. MMM', { locale: dateLocale });
                        const timeStr = booking.startTime && booking.endTime ? `${booking.startTime} – ${booking.endTime}` : getSlotLabel(booking);
                        const text = t.whatsAppBookingText(booking.userName, dateFormatted, timeStr, booking.destinationNote);
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title={t.shareBookingWhatsApp}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {canCancel && (
                      <button
                        onClick={() => {
                          triggerHaptic('warning');
                          if (confirm(t.cancelConfirm(booking.userName))) {
                            cancelBooking(booking.id);
                          }
                        }}
                        className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title={t.cancelReservation}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Destination / Purpose Note */}
                {booking.destinationNote && (
                  <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{booking.destinationNote}</span>
                  </div>
                )}

                {/* WAITING LIST ALERT BANNER */}
                {waitingForBooking.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <p className="font-bold text-amber-900 dark:text-amber-300">
                          {t.waitingAlert(waitingForBooking[0]?.userName || '', waitingForBooking.length)}
                        </p>
                        {isUserBooking ? (
                          <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                            {t.waitingAlertOwner}
                          </p>
                        ) : (
                          <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                            {t.waitingAlertOther}
                          </p>
                        )}

                        {/* Handover action if current user owns this booking */}
                        {isUserBooking && (
                          <div className="mt-2.5 pt-2 border-t border-amber-200/60 dark:border-amber-800/60 flex items-center justify-end">
                            <button
                              onClick={() => {
                                if (window.confirm(t.handoverConfirm(waitingForBooking[0].userName, booking.startDate))) {
                                  handoverBookingToWaitingUser(booking.id, waitingForBooking[0].id);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs active-press cursor-pointer flex items-center gap-1.5"
                            >
                              <HandMetal className="w-3.5 h-3.5" />
                              <span>{t.handoverBookingBtn(waitingForBooking[0].userName)}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* WAITING LIST CARDS FOR THIS DAY */}
        {dayWaitingList.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 px-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.waitingListTitle} ({dayWaitingList.length})</span>
            </h4>
            <div className="space-y-2.5">
              {dayWaitingList.map((item, idx) => {
                const isCurrentUserWaiting = item.userId === currentUser.id;
                const isOffered = item.status === 'offered';

                // Find booked holder for this slot if any
                const slotBooking = dayBookings.find(
                  b => b.id === item.bookingId || b.slotType === item.slotType || b.slotType === 'full-day'
                );

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isOffered
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200 shadow-sm'
                        : isCurrentUserWaiting
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/60'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.userColor }}
                        />
                        <div className="min-w-0 truncate">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.userName}</span>
                          {isCurrentUserWaiting && (
                            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-[#0071e3] dark:text-[#0a84ff]">
                              {t.activeProfile}
                            </span>
                          )}
                          <span className="text-zinc-400 dark:text-zinc-500 ml-1.5 text-xs font-medium">
                            ({item.slotType})
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          isOffered
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {isOffered ? t.statusOffered : t.queuePosition(idx + 1)}
                      </span>
                    </div>

                    {/* Actions Row */}
                    <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {slotBooking && t.currentlyBookedBy(slotBooking.userName)}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* WhatsApp Nudge if someone else is booked */}
                        {isCurrentUserWaiting && slotBooking && slotBooking.userId !== currentUser.id && !isOffered && (
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              t.whatsAppNudgeText(slotBooking.userName, item.date, item.slotType)
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => triggerHaptic('light')}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 active-press"
                            title={t.whatsAppNudge}
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{t.whatsAppNudge}</span>
                          </a>
                        )}

                        {/* Claim Button if Slot Offered */}
                        {isOffered && isCurrentUserWaiting && (
                          <button
                            onClick={() => {
                              triggerHaptic('success');
                              claimFreedSlot(item.id);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all active-press cursor-pointer"
                          >
                            {t.claimSlot}
                          </button>
                        )}

                        {/* Leave Waiting List Button */}
                        {isCurrentUserWaiting && (
                          <button
                            onClick={() => {
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
    </div>
  );
};
