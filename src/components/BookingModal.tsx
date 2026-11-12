import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Clock, AlertTriangle, Check, UserCheck, Car, Layers } from 'lucide-react';
import type { BookingSlotType } from '../types';
import confetti from 'canvas-confetti';
import { format, addDays } from 'date-fns';
import { triggerHaptic } from '../lib/haptics';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: string;
  initialSlot?: BookingSlotType;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialSlot = 'full-day'
}) => {
  const { currentUser, createBooking, createMultipleBookings, joinWaitingList, checkConflict, t, dateLocale } = useApp();

  const [date, setDate] = useState<string>(initialDate);
  const [slotType, setSlotType] = useState<BookingSlotType>(initialSlot);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [destinationNote, setDestinationNote] = useState<string>('');
  const [conflict, setConflict] = useState<any>(null);

  // Multi-day selection state
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([initialDate]);

  // Update date & slot when initial props change
  useEffect(() => {
    const targetDate = initialDate || date;
    if (initialDate) {
      setDate(initialDate);
      setSelectedDates([initialDate]);
    }
    if (initialSlot) {
      setSlotType(initialSlot);
    } else {
      // Pick best free slot to avoid immediately triggering a conflict error
      if (!checkConflict(targetDate, 'full-day')) {
        setSlotType('full-day');
      } else if (!checkConflict(targetDate, 'morning')) {
        setSlotType('morning');
      } else if (!checkConflict(targetDate, 'afternoon')) {
        setSlotType('afternoon');
      } else if (!checkConflict(targetDate, 'evening')) {
        setSlotType('evening');
      } else {
        setSlotType('custom');
      }
    }
    setIsMultiDay(false);
  }, [initialDate, initialSlot, isOpen]);

  // Generate selectable dates for multi-day picker (starting from base date up to 14 days ahead)
  const baseDateObj = date ? new Date(date + 'T00:00:00') : new Date();
  const availableUpcomingDays = Array.from({ length: 12 }, (_, i) => addDays(baseDateObj, i));

  const toggleAdditionalDate = (dateStr: string) => {
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr].sort();
      }
    });
  };

  // Check for conflict dynamically
  useEffect(() => {
    if (!isOpen) return;
    const existing = checkConflict(
      date,
      slotType,
      slotType === 'custom' ? startTime : undefined,
      slotType === 'custom' ? endTime : undefined
    );
    setConflict(existing);
  }, [date, slotType, startTime, endTime, isOpen, checkConflict]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');

    if (isMultiDay && selectedDates.length > 1) {
      // Multi-day booking flow
      const result = createMultipleBookings({
        dates: selectedDates,
        slotType,
        startTime: slotType === 'custom' ? startTime : undefined,
        endTime: slotType === 'custom' ? endTime : undefined,
        destinationNote: destinationNote.trim() || ''
      });

      if (result.bookedCount > 0) {
        confetti({
          particleCount: 55,
          spread: 65,
          origin: { y: 0.65 }
        });
      }
      onClose();
    } else {
      // Single day flow
      if (conflict) {
        if (conflict.userId === currentUser.id) {
          // You already have this slot booked - cannot waitlist yourself!
          return;
        }
        joinWaitingList(
          conflict.id,
          slotType,
          slotType === 'custom' ? startTime : undefined,
          slotType === 'custom' ? endTime : undefined
        );
        onClose();
      } else {
        const result = createBooking({
          startDate: date,
          slotType,
          startTime: slotType === 'custom' ? startTime : undefined,
          endTime: slotType === 'custom' ? endTime : undefined,
          destinationNote: destinationNote.trim() || ''
        });

        if (result.success) {
          confetti({
            particleCount: 45,
            spread: 55,
            origin: { y: 0.65 }
          });
          onClose();
        }
      }
    }
  };

  const isMultipleSelected = isMultiDay && selectedDates.length > 1;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl p-5 space-y-4 text-zinc-900 dark:text-zinc-100 animate-sheet-up transition-colors">
        {/* iOS Drag Handle on Mobile */}
        <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto -mt-1 mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#0a84ff]">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">{t.reserveCarModalTitle}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.reservingAs} <span className="font-semibold text-zinc-800 dark:text-zinc-200">{currentUser.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Primary Date Picker & Multi-Day Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
                <span>{t.reservationDate}</span>
              </label>

              {/* Multi-Day Mode Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  const next = !isMultiDay;
                  setIsMultiDay(next);
                  if (next && !selectedDates.includes(date)) {
                    setSelectedDates([date]);
                  }
                }}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-all active-press ${
                  isMultiDay
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0071e3] dark:border-[#0a84ff] text-[#0071e3] dark:text-[#0a84ff]'
                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>{t.multiDayToggle}</span>
              </button>
            </div>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedDates([e.target.value]);
              }}
              required
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#0071e3] font-medium"
            />

            {/* Multi-Day Interactive Chips Picker */}
            {isMultiDay && (
              <div className="mt-2.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#0071e3] dark:text-[#0a84ff]">
                    {t.multiDaySelected(selectedDates.length)}
                  </span>
                  <span className="text-zinc-400 text-[10px]">
                    {selectedDates.length > 1 ? selectedDates.join(', ') : ''}
                  </span>
                </div>

                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {t.multiDayHint}
                </p>

                {/* Day Selection Chips Grid */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                  {availableUpcomingDays.map(d => {
                    const dStr = format(d, 'yyyy-MM-dd');
                    const isSelected = selectedDates.includes(dStr);

                    return (
                      <button
                        type="button"
                        key={dStr}
                        onClick={() => toggleAdditionalDate(dStr)}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex flex-col items-center shrink-0 transition-all active-press ${
                          isSelected
                            ? 'bg-[#0071e3] dark:bg-[#0a84ff] border-[#0071e3] dark:border-[#0a84ff] text-white shadow-2xs'
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                        }`}
                      >
                        <span className={`text-[9px] uppercase ${isSelected ? 'text-blue-100' : 'text-zinc-400'}`}>
                          {format(d, 'EEE', { locale: dateLocale })}
                        </span>
                        <span className="text-xs font-bold">{format(d, 'd')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Time Presets */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
              {t.timeBlock}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSlotType('full-day')}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                  slotType === 'full-day'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0071e3] dark:border-[#0a84ff] text-[#0071e3] dark:text-[#0a84ff] shadow-2xs font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 font-semibold'
                }`}
              >
                <div>{t.slotFullDay}</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">{t.slotFullDaySub}</div>
              </button>

              <button
                type="button"
                onClick={() => setSlotType('morning')}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                  slotType === 'morning'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0071e3] dark:border-[#0a84ff] text-[#0071e3] dark:text-[#0a84ff] shadow-2xs font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 font-semibold'
                }`}
              >
                <div>{t.slotMorning}</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">{t.slotMorningSub}</div>
              </button>

              <button
                type="button"
                onClick={() => setSlotType('afternoon')}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                  slotType === 'afternoon'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0071e3] dark:border-[#0a84ff] text-[#0071e3] dark:text-[#0a84ff] shadow-2xs font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 font-semibold'
                }`}
              >
                <div>{t.slotAfternoon}</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">{t.slotAfternoonSub}</div>
              </button>

              <button
                type="button"
                onClick={() => setSlotType('evening')}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                  slotType === 'evening'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0071e3] dark:border-[#0a84ff] text-[#0071e3] dark:text-[#0a84ff] shadow-2xs font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 font-semibold'
                }`}
              >
                <div>{t.slotEvening}</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">{t.slotEveningSub}</div>
              </button>
            </div>

            {/* Custom Hours Option */}
            <button
              type="button"
              onClick={() => setSlotType('custom')}
              className={`mt-2 w-full py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                slotType === 'custom'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0071e3] dark:border-[#0a84ff] text-[#0071e3] dark:text-[#0a84ff]'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
              }`}
            >
              {t.slotCustomBtn}
            </button>
          </div>

          {/* Custom Hours inputs */}
          {slotType === 'custom' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div>
                <label className="block text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold mb-1">{t.from}</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold mb-1">{t.until}</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Trip Note / Destination */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t.tripReasonLabel}
            </label>
            <input
              type="text"
              placeholder={t.tripReasonPlaceholder}
              value={destinationNote}
              onChange={(e) => setDestinationNote(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0071e3]"
            />
          </div>

          {/* Conflict Alert & Waiting List Banner (For single day) */}
          {!isMultipleSelected && conflict && (
            conflict.userId === currentUser.id ? (
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 text-xs space-y-1.5">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#0071e3] dark:text-[#0a84ff] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-200">{t.alreadyBookedByYou}</h4>
                    <p className="mt-0.5 text-blue-800 dark:text-blue-300/90 leading-relaxed">
                      {t.alreadyBookedByYouSub}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 dark:text-amber-300">{t.conflictTitle}</h4>
                    <p className="mt-0.5 text-amber-800 dark:text-amber-200/90 leading-relaxed">
                      {t.conflictText(conflict.userName, date, conflict.slotType)}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300/90 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.conflictHint(conflict.userName.split(' ')[0])}</span>
                </div>
              </div>
            )
          )}

          {/* Primary Action Button */}
          <div className="pt-2">
            {!isMultipleSelected && conflict ? (
              conflict.userId === currentUser.id ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 px-4 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.alreadyReservedBtn}</span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-600/25 flex items-center justify-center gap-2 transition-all active-press cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>{t.joinWaitingList}</span>
                </button>
              )
            ) : (
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#0a84ff] dark:hover:bg-[#409cff] text-white font-bold text-sm shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active-press cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isMultipleSelected
                    ? t.confirmMultiReservation(selectedDates.length)
                    : t.confirmReservation}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
