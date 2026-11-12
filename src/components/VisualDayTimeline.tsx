import React from 'react';
import type { Booking, BookingSlotType } from '../types';
import { Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';

interface VisualDayTimelineProps {
  dateStr: string;
  isToday: boolean;
  bookings: Booking[];
  onOpenBookingModal: (dateStr: string, defaultSlot?: BookingSlotType) => void;
}

// Map standard slot hours to numerical ranges (0 - 24)
export const getSlotHours = (slotType: BookingSlotType, startTime?: string, endTime?: string): [number, number] => {
  const parseHour = (timeStr?: string, defaultHour = 0) => {
    if (!timeStr) return defaultHour;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) + (m || 0) / 60;
  };

  switch (slotType) {
    case 'morning':
      return [8, 13];
    case 'afternoon':
      return [13, 18];
    case 'evening':
      return [18, 23];
    case 'full-day':
      return [0, 24];
    case 'custom':
      return [parseHour(startTime, 9), parseHour(endTime, 17)];
    default:
      return [8, 20];
  }
};

export const VisualDayTimeline: React.FC<VisualDayTimelineProps> = ({
  dateStr,
  isToday,
  bookings,
  onOpenBookingModal
}) => {
  const { t } = useApp();

  // We represent the active day span between 07:00 (7 AM) and 23:00 (11 PM) = 16 hours total
  const START_HOUR = 7;
  const END_HOUR = 23;
  const TOTAL_HOURS = END_HOUR - START_HOUR;

  // Current time marker for today
  const now = new Date();
  const currentHourDecimal = now.getHours() + now.getMinutes() / 60;
  const showCurrentTime = isToday && currentHourDecimal >= START_HOUR && currentHourDecimal <= END_HOUR;
  const currentTimePercent = showCurrentTime
    ? Math.min(100, Math.max(0, ((currentHourDecimal - START_HOUR) / TOTAL_HOURS) * 100))
    : null;

  function formatHour(h: number) {
    const intH = Math.floor(h);
    const m = Math.round((h - intH) * 60);
    return `${String(intH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // Calculate layout for each booking on the timeline
  const renderedBookings = bookings.map(b => {
    const isFullDay = b.slotType === 'full-day';
    if (isFullDay) {
      return {
        ...b,
        isFullDay: true,
        leftPercent: 0,
        widthPercent: 100,
        timeLabel: `${t.slotFullDay} (${t.slotFullDaySub})`
      };
    }

    const [start, end] = getSlotHours(b.slotType, b.startTime, b.endTime);
    const clampedStart = Math.max(START_HOUR, Math.min(END_HOUR, start));
    const clampedEnd = Math.max(START_HOUR, Math.min(END_HOUR, end));
    const leftPercent = ((clampedStart - START_HOUR) / TOTAL_HOURS) * 100;
    const widthPercent = Math.max(4, ((clampedEnd - clampedStart) / TOTAL_HOURS) * 100);

    return {
      ...b,
      isFullDay: false,
      leftPercent,
      widthPercent,
      timeLabel: `${b.startTime || formatHour(start)} - ${b.endTime || formatHour(end)}`
    };
  });

  // Check preset slot availability
  const isSlotBooked = (type: BookingSlotType): boolean => {
    const [targetStart, targetEnd] = getSlotHours(type);
    return bookings.some(b => {
      const [bStart, bEnd] = getSlotHours(b.slotType, b.startTime, b.endTime);
      return Math.max(targetStart, bStart) < Math.min(targetEnd, bEnd);
    });
  };

  const morningBooked = isSlotBooked('morning');
  const afternoonBooked = isSlotBooked('afternoon');
  const eveningBooked = isSlotBooked('evening');
  const allFree = bookings.length === 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm transition-colors duration-200">
      {/* Header: Visual Timeline Title & Quick Summary */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff]" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t.timelineTitle}
          </span>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            allFree
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
              : bookings.length >= 3
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
          }`}
        >
          {allFree ? t.freeAllDay : t.reservedBlocks(bookings.length)}
        </span>
      </div>

      {/* The Visual Bar */}
      <div className="relative pt-1 pb-4">
        {/* Timeline Bar Background Track */}
        <div className="relative h-11 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-xl overflow-hidden border border-zinc-200/70 dark:border-zinc-700/60 flex select-none">
          {/* Hour grid ticks background */}
          <div className="absolute inset-0 grid grid-cols-4 pointer-events-none divide-x divide-zinc-200/80 dark:divide-zinc-700/50">
            <div />
            <div />
            <div />
            <div />
          </div>

          {/* Rendered Bookings Blocks */}
          {renderedBookings.map(b => (
            <div
              key={b.id}
              className={`absolute shadow-sm flex items-center px-2.5 z-10 transition-transform active:scale-[0.98] overflow-hidden ${
                b.isFullDay
                  ? 'inset-x-1 top-1 bottom-1 rounded-lg'
                  : 'top-1 bottom-1 rounded-lg'
              }`}
              style={{
                left: b.isFullDay ? undefined : `${b.leftPercent}%`,
                width: b.isFullDay ? undefined : `${b.widthPercent}%`,
                backgroundColor: b.userColor,
                minWidth: '40px'
              }}
              title={`${b.userName}: ${b.timeLabel}`}
            >
              <div className="flex items-center gap-1.5 min-w-0 text-white">
                <span className="w-5 h-5 rounded-full bg-white/25 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {b.userName.charAt(0)}
                </span>
                <span
                  className={`text-[11px] font-semibold truncate leading-none drop-shadow-sm ${
                    b.isFullDay ? 'inline' : 'hidden sm:inline'
                  }`}
                >
                  {b.userName.split(' ')[0]}
                  {b.isFullDay ? ` • ${t.slotFullDay}` : ''}
                </span>
              </div>
            </div>
          ))}

          {/* Current Time Indicator Line (for Today) */}
          {currentTimePercent !== null && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 shadow-md"
              style={{ left: `${currentTimePercent}%` }}
              title={`Current: ${format(now, 'HH:mm')}`}
            >
              <span className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-rose-500" />
            </div>
          )}

          {/* Tap-anywhere hint if completely free */}
          {allFree && (
            <button
              onClick={() => onOpenBookingModal(dateStr, 'full-day')}
              className="w-full h-full flex items-center justify-center text-xs font-semibold text-zinc-400 dark:text-zinc-500 hover:text-[#0071e3] dark:hover:text-[#0a84ff] gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.tapToBookFullDay}</span>
            </button>
          )}
        </div>

        {/* Time tick labels under the bar */}
        <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1.5 px-0.5">
          <span>07:00</span>
          <span>11:00</span>
          <span>15:00</span>
          <span>19:00</span>
          <span>23:00</span>
        </div>
      </div>

      {/* Quick Slot Booking Action Pills */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 block mb-2">
          {t.quickReserve}
        </span>
        <div className="grid grid-cols-3 gap-2">
          {/* Morning Slot */}
          <button
            onClick={() => onOpenBookingModal(dateStr, 'morning')}
            disabled={morningBooked}
            className={`py-2 px-1.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
              morningBooked
                ? 'bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200/50 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 line-through opacity-60 cursor-not-allowed'
                : 'bg-zinc-50 dark:bg-zinc-800/90 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:border-[#0071e3] dark:hover:border-[#0a84ff] hover:text-[#0071e3] dark:hover:text-[#0a84ff] active-press shadow-2xs'
            }`}
          >
            <span className="font-bold">{t.slotMorning}</span>
            <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-400">{t.slotMorningSub}</span>
          </button>

          {/* Afternoon Slot */}
          <button
            onClick={() => onOpenBookingModal(dateStr, 'afternoon')}
            disabled={afternoonBooked}
            className={`py-2 px-1.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
              afternoonBooked
                ? 'bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200/50 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 line-through opacity-60 cursor-not-allowed'
                : 'bg-zinc-50 dark:bg-zinc-800/90 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:border-[#0071e3] dark:hover:border-[#0a84ff] hover:text-[#0071e3] dark:hover:text-[#0a84ff] active-press shadow-2xs'
            }`}
          >
            <span className="font-bold">{t.slotAfternoon}</span>
            <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-400">{t.slotAfternoonSub}</span>
          </button>

          {/* Evening Slot */}
          <button
            onClick={() => onOpenBookingModal(dateStr, 'evening')}
            disabled={eveningBooked}
            className={`py-2 px-1.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
              eveningBooked
                ? 'bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200/50 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 line-through opacity-60 cursor-not-allowed'
                : 'bg-zinc-50 dark:bg-zinc-800/90 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:border-[#0071e3] dark:hover:border-[#0a84ff] hover:text-[#0071e3] dark:hover:text-[#0a84ff] active-press shadow-2xs'
            }`}
          >
            <span className="font-bold">{t.slotEvening}</span>
            <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-400">{t.slotEveningSub}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
