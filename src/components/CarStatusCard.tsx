import React from 'react';
import { useApp } from '../context/AppContext';
import { Fuel, Key, MapPin, CheckCircle2, Clock, Sparkles, Navigation, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { triggerHaptic } from '../lib/haptics';

interface CarStatusCardProps {
  onOpenReturnModal: () => void;
}

export const CarStatusCard: React.FC<CarStatusCardProps> = ({ onOpenReturnModal }) => {
  const { vehicle, bookings, t } = useApp();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const nowTime = format(new Date(), 'HH:mm');

  // Find if a booking is active right now
  const currentBooking = bookings.find(b => {
    if (b.status !== 'confirmed' || b.startDate !== todayStr) return false;
    if (b.slotType === 'full-day') return true;
    const start = b.startTime || '00:00';
    const end = b.endTime || '23:59';
    return nowTime >= start && nowTime <= end;
  });

  // Find next upcoming booking
  const nextBooking = bookings
    .filter(b => b.status === 'confirmed' && (b.startDate > todayStr || (b.startDate === todayStr && (b.startTime || '23:59') > nowTime)))
    .sort((a, b) => (a.startDate + (a.startTime || '00:00')).localeCompare(b.startDate + (b.startTime || '00:00')))[0];

  const isLowFuel = vehicle.fuelOrBatteryPercent < 25;

  const fuelGradient =
    vehicle.fuelOrBatteryPercent > 50
      ? 'from-emerald-500 to-teal-400'
      : vehicle.fuelOrBatteryPercent > 20
      ? 'from-amber-500 to-yellow-400'
      : 'from-rose-500 to-red-400';

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-colors">
      {/* Top row: Vehicle Name & Current Live Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
              {vehicle.name}
            </h2>
            {vehicle.licensePlate && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded border border-zinc-200 dark:border-zinc-700">
                {vehicle.licensePlate}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{vehicle.model}</p>
        </div>

        {/* Live Availability Badge */}
        {currentBooking ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t.inUse(currentBooking.userName.split(' ')[0])}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.available}</span>
          </div>
        )}
      </div>

      {/* Low fuel warning banner */}
      {isLowFuel && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="font-semibold">{t.lowFuelWarning}</span>
        </div>
      )}

      {/* Next Trip Banner */}
      {!currentBooking && nextBooking && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
          <span className="text-zinc-400 font-medium">{t.nextTrip}</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-100">
            {nextBooking.startDate === todayStr ? t.today : nextBooking.startDate}
            {' · '}
            {nextBooking.startTime || nextBooking.slotType} ({nextBooking.userName.split(' ')[0]})
          </span>
        </div>
      )}

      {/* Fuel Gauge */}
      <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
              <Fuel className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
              {vehicle.isElectric ? t.batteryLevel : t.fuelLevel}
            </span>
            <span className={`font-bold ${isLowFuel ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
              {vehicle.fuelOrBatteryPercent}%
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-700">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${fuelGradient} transition-all duration-500`}
              style={{ width: `${Math.max(5, Math.min(100, vehicle.fuelOrBatteryPercent))}%` }}
            />
          </div>
        </div>

        {/* Location & Keys Chips */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">{t.parkedAt}</span>
              <p className="text-zinc-800 dark:text-zinc-200 font-semibold truncate" title={vehicle.parkingLocation}>
                {vehicle.parkingLocation}
              </p>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 flex items-start gap-2">
            <Key className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">{t.keys}</span>
              <p className="text-zinc-800 dark:text-zinc-200 font-semibold truncate" title={vehicle.keyLocation}>
                {vehicle.keyLocation}
              </p>
            </div>
          </div>
        </div>

        {/* Last updated note */}
        {vehicle.lastUpdatedAt && (
          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3 text-emerald-500" />
              {vehicle.parkingLocation}
            </span>
            <span>{vehicle.lastUpdatedBy ? `${vehicle.lastUpdatedBy.split(' ')[0]}` : ''}</span>
          </div>
        )}
      </div>

      {/* Quick Action: Return Car / Update Fuel Button */}
      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end">
        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenReturnModal();
          }}
          className="text-xs font-bold text-[#0071e3] dark:text-[#0a84ff] hover:text-blue-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/50 transition-all active-press cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.updateStatusReturnBtn}</span>
        </button>
      </div>
    </div>
  );
};
