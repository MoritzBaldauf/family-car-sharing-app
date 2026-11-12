import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BMobilLogo } from './BMobilLogo';
import { Sparkles, Check, UserPlus, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  '#0071e3', // Apple Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber / Bat-Yellow
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#6366f1'  // Indigo
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { allUsers, switchUser, addFamilyMember, t } = useApp();
  const [mode, setMode] = useState<'select' | 'create'>(() =>
    allUsers.length > 0 ? 'select' : 'create'
  );
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  if (!isOpen) return null;

  const handleSelectExisting = (userId: string) => {
    switchUser(userId);
    localStorage.setItem('b_mobil_user_id', userId);
    // Remove query params like ?join=BMOBIL from URL
    window.history.replaceState({}, '', window.location.pathname);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onClose();
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const email = `${name.toLowerCase().replace(/\s+/g, '')}@b-mobil.local`;
    addFamilyMember(name.trim(), email, selectedColor);

    window.history.replaceState({}, '', window.location.pathname);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-zinc-900 dark:text-zinc-100 animate-scale-up space-y-5">
        
        {/* Batmobil Header & Badge */}
        <div className="flex flex-col items-center text-center pt-2">
          <BMobilLogo size={64} className="mb-3" />
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.welcomeTitle}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[260px] leading-relaxed">
            {t.welcomeSubtitle}
          </p>
        </div>

        {/* Existing Member Selection Mode */}
        {mode === 'select' && allUsers.length > 0 ? (
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
              {t.selectExistingProfile}
            </span>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectExisting(u.id)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all text-left cursor-pointer active-press group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-9 h-9 rounded-full text-xs font-bold text-white flex items-center justify-center shadow-xs shrink-0"
                      style={{ backgroundColor: u.color }}
                    >
                      {u.name.charAt(0)}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                        {u.name}
                      </span>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        {u.role === 'admin' ? t.admin : 'Fahrer'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#0071e3] dark:group-hover:text-[#0a84ff] transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>

            {/* Toggle to Create New Profile */}
            <button
              onClick={() => setMode('create')}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.addMember}</span>
            </button>
          </div>
        ) : (
          /* Create New Profile Form */
          <form onSubmit={handleCreateNew} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t.yourName}
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                {t.pickColor}
              </label>
              <div className="flex items-center justify-between gap-1.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                      selectedColor === c ? 'scale-115 ring-2 ring-offset-2 ring-zinc-900 dark:ring-zinc-100 dark:ring-offset-zinc-900' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {selectedColor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#0a84ff] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active-press"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.joinPoolBtn}</span>
            </button>

            {allUsers.length > 0 && (
              <button
                type="button"
                onClick={() => setMode('select')}
                className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors pt-1 cursor-pointer"
              >
                ← {t.selectExistingProfile}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};