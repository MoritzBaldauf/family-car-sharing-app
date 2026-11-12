import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Fuel, MapPin, Key, Check } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';

interface ReturnCarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReturnCarModal: React.FC<ReturnCarModalProps> = ({ isOpen, onClose }) => {
  const { vehicle, updateVehicleStatus, t } = useApp();

  const [fuelPercent, setFuelPercent] = useState<number>(vehicle.fuelOrBatteryPercent);
  const [parkingLocation, setParkingLocation] = useState<string>(vehicle.parkingLocation);
  const [keyLocation, setKeyLocation] = useState<string>(vehicle.keyLocation);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setFuelPercent(vehicle.fuelOrBatteryPercent);
      setParkingLocation(vehicle.parkingLocation);
      setKeyLocation(vehicle.keyLocation);
    }
  }, [isOpen, vehicle]);

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
    updateVehicleStatus({
      fuelOrBatteryPercent: Number(fuelPercent),
      parkingLocation: parkingLocation.trim() || vehicle.parkingLocation,
      keyLocation: keyLocation.trim() || vehicle.keyLocation
    });
    onClose();
  };

  const presetLocations = [
    t.presetLocationDriveway,
    t.presetLocationStreet,
    t.presetLocationGarage
  ];

  const presetKeys = [
    t.presetKeyHallway,
    t.presetKeyKitchen,
    t.presetKeyConsole
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4 text-zinc-900 dark:text-zinc-100 animate-sheet-up transition-colors">
        {/* iOS Drag Handle on Mobile */}
        <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto -mt-1 mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">{t.returnCarTitle}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.returnCarSubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fuel / Battery Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
                {vehicle.isElectric ? t.batteryLevel : t.fuelLevel}
              </span>
              <span className="text-base font-extrabold text-[#0071e3] dark:text-[#0a84ff]">{fuelPercent}%</span>
            </div>

            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={fuelPercent}
              onChange={(e) => setFuelPercent(Number(e.target.value))}
              className="w-full accent-[#0071e3] dark:accent-[#0a84ff] h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
            />

            {/* Quick % buttons */}
            <div className="flex items-center justify-between gap-1.5 mt-2">
              {[25, 50, 75, 100].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => {
                    triggerHaptic('light');
                    setFuelPercent(val);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all active-press cursor-pointer ${
                    fuelPercent === val
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0071e3] dark:border-[#0a84ff] text-[#0071e3] dark:text-[#0a84ff] shadow-2xs'
                      : 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

          {/* Parking Location */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
              {t.whereParked}
            </label>
            <input
              type="text"
              value={parkingLocation}
              onChange={(e) => setParkingLocation(e.target.value)}
              placeholder="e.g. Einfahrt, Straße..."
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0071e3]"
            />
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetLocations.map(loc => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => {
                    triggerHaptic('light');
                    setParkingLocation(loc);
                  }}
                  className="text-[11px] font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-full transition-colors active-press cursor-pointer"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Key Location */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              {t.whereKeys}
            </label>
            <input
              type="text"
              value={keyLocation}
              onChange={(e) => setKeyLocation(e.target.value)}
              placeholder="e.g. Schlüsselbrett im Flur"
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0071e3]"
            />
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetKeys.map(k => (
                <button
                  type="button"
                  key={k}
                  onClick={() => {
                    triggerHaptic('light');
                    setKeyLocation(k);
                  }}
                  className="text-[11px] font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-full transition-colors active-press cursor-pointer"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active-press cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t.saveVehicleStatus}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
