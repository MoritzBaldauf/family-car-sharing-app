import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BMobilLogo } from './BMobilLogo';
import { Lock, KeyRound, User, Plus, ArrowLeft, ArrowRight, ShieldCheck, Check } from 'lucide-react';

const AVATAR_COLORS = [
  '#0071e3', // Apple Blue
  '#34c759', // Apple Green
  '#ff9500', // Apple Orange
  '#af52de', // Apple Purple
  '#ff2d55', // Apple Pink
  '#5856d6', // Apple Indigo
  '#00c7be', // Apple Teal
  '#ff3b30'  // Apple Red
];

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const {
    isFamilyUnlocked,
    isAuthenticated,
    unlockFamily,
    loginWithPin,
    createMemberWithPin,
    allUsers,
    family,
    t
  } = useApp();

  // Step 1: Family Passcode Gate state
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // Step 2: Personal Profile & PIN state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New member form
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(AVATAR_COLORS[0]);
  const [newPin, setNewPin] = useState('');

  // 1. If unlocked & authenticated, render main application
  if (isFamilyUnlocked && isAuthenticated) {
    return <>{children}</>;
  }

  // Handle Gate 1: Family Passcode submission
  const handleUnlockFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    const success = unlockFamily(passcode);
    if (success) {
      setPasscodeError(false);
      setPasscode('');
    } else {
      setPasscodeError(true);
    }
  };

  // Handle Gate 2A: Existing Member PIN login
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || pin.length < 4) return;

    const success = loginWithPin(selectedUserId, pin);
    if (success) {
      setPinError(false);
      setPin('');
      setSelectedUserId(null);
    } else {
      setPinError(true);
    }
  };

  // Handle Gate 2B: Create New Member
  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newPin.length < 4) return;

    createMemberWithPin(newName.trim(), newColor, newPin);
    setNewName('');
    setNewPin('');
    setIsCreatingNew(false);
  };

  const selectedUser = selectedUserId ? allUsers.find(u => u.id === selectedUserId) : null;
  const userNeedsPinSetup = selectedUser && !selectedUser.pin;

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex flex-col items-center justify-center p-4 antialiased text-[var(--text-primary)] select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 blur-3xl rounded-full" />
      </div>

      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Aerodynamic B-Mobil Logo Header */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <BMobilLogo size={58} />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              B-Mobil
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">
              {t.welcomeSubtitle}
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* GATE 1: FAMILY PASSCODE (Blocks uninvited strangers completely) */}
        {/* ------------------------------------------------------------- */}
        {!isFamilyUnlocked && (
          <form onSubmit={handleUnlockFamily} className="space-y-4">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#0a84ff] mb-1">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {t.familyPasscodeTitle}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                {t.familyPasscodeDesc}
              </p>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (passcodeError) setPasscodeError(false);
                  }}
                  placeholder={t.familyPasscodePlaceholder}
                  autoFocus
                  required
                  className={`w-full text-center tracking-widest text-base font-mono font-bold bg-zinc-100 dark:bg-zinc-800/80 border rounded-2xl px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none transition-all ${
                    passcodeError
                      ? 'border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-zinc-200 dark:border-zinc-700 focus:border-[#0071e3]'
                  }`}
                />
              </div>

              {passcodeError && (
                <p className="text-center text-xs font-semibold text-rose-500 animate-fade-in">
                  {t.familyPasscodeError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#0a84ff] dark:hover:bg-[#409cff] text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active-press cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.familyPasscodeSubmit}</span>
            </button>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* GATE 2: MEMBER LOGIN & PIN ACCESS (Single user locked device) */}
        {/* ------------------------------------------------------------- */}
        {isFamilyUnlocked && !isAuthenticated && (
          <div>
            {/* View A: Enter PIN for Selected Member */}
            {selectedUserId && selectedUser ? (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserId(null);
                      setPin('');
                      setPinError(false);
                    }}
                    className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-zinc-400 font-semibold">{t.activeProfile}</span>
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md"
                    style={{ backgroundColor: selectedUser.color }}
                  >
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedUser.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {userNeedsPinSetup ? t.setPersonalPinDesc : t.personalPinDesc}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      if (pinError) setPinError(false);
                    }}
                    placeholder="••••"
                    autoFocus
                    required
                    className={`w-full text-center tracking-[0.6em] text-2xl font-mono font-bold bg-zinc-100 dark:bg-zinc-800/80 border rounded-2xl px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none transition-all ${
                      pinError
                        ? 'border-rose-500 ring-2 ring-rose-500/20'
                        : 'border-zinc-200 dark:border-zinc-700 focus:border-[#0071e3]'
                    }`}
                  />
                  {pinError && (
                    <p className="text-center text-xs font-semibold text-rose-500 animate-fade-in">
                      {t.pinError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pin.length < 4}
                  className="w-full py-3 px-4 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#0a84ff] dark:hover:bg-[#409cff] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active-press cursor-pointer"
                >
                  <span>{userNeedsPinSetup ? t.saveMember : t.familyPasscodeSubmit}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : isCreatingNew ? (
              /* View B: Create New Member Profile */
              <form onSubmit={handleCreateMember} className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-zinc-400 font-semibold">{t.addMember}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {t.yourName}
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    required
                    autoFocus
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {t.pickColor}
                  </label>
                  <div className="flex items-center justify-between gap-1.5">
                    {AVATAR_COLORS.map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewColor(c)}
                        className={`w-8 h-8 rounded-full transition-transform active-press flex items-center justify-center cursor-pointer ${
                          newColor === c ? 'scale-110 ring-2 ring-offset-2 ring-zinc-500 shadow-md' : 'opacity-85 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      >
                        {newColor === c && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {t.setPersonalPinTitle} (4 {t.pinPlaceholder})
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="••••"
                    required
                    className="w-full text-center tracking-[0.5em] text-lg font-mono font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {t.setPersonalPinDesc}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!newName.trim() || newPin.length < 4}
                  className="w-full py-3 px-4 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#0a84ff] dark:hover:bg-[#409cff] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active-press cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>{t.joinPoolBtn}</span>
                </button>
              </form>
            ) : (
              /* View C: Profile Picker List */
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {t.selectExistingProfile}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {family.name}
                  </p>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                  {allUsers.map(user => (
                    <button
                      type="button"
                      key={user.id}
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setPin('');
                        setPinError(false);
                      }}
                      className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/70 flex items-center justify-between transition-all active-press cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                            {user.name}
                          </span>
                          <span className="text-[11px] text-zinc-400 capitalize">
                            {user.role}
                          </span>
                        </div>
                      </div>
                      <KeyRound className="w-4 h-4 text-zinc-400 group-hover:text-[#0071e3] transition-colors" />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 text-zinc-600 dark:text-zinc-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addMember}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
