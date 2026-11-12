import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Share2,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Plus,
  Globe,
  LogOut,
  Lock
} from 'lucide-react';

export const FamilyView: React.FC = () => {
  const {
    family,
    currentUser,
    allUsers,
    signOut,
    addFamilyMember,
    clearTestDataAndStartFresh,
    language,
    setLanguage,
    t
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberColor, setNewMemberColor] = useState('#0071e3');

  const PROD_URL = 'https://b-mobil-sharing.web.app';
  const origin = typeof window !== 'undefined' ? window.location.origin : PROD_URL;
  const baseUrl = origin.includes('localhost') || origin.includes('127.0.0.1')
    ? PROD_URL
    : origin;
  const joinLink = `${baseUrl}/?join=${family.joinCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(family.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = t.whatsAppInviteText(joinLink, family.passcode || 'BMOBIL2026');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    addFamilyMember(
      newMemberName.trim(),
      newMemberEmail.trim() || `${newMemberName.toLowerCase().replace(/\s+/g, '')}@b-mobil.local`,
      newMemberColor
    );
    setNewMemberName('');
    setNewMemberEmail('');
    setShowAddMember(false);
  };

  const colors = ['#0071e3', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {t.familySettingsTitle}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t.familySettingsSubtitle}
        </p>
      </div>

      {/* Active User Card with Secure Device Sign-Out */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm transition-colors">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-2.5">
          {t.activeProfile}
        </span>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-xs"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {currentUser.name}
                </h3>
                {currentUser.role === 'admin' && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-semibold border border-amber-200 dark:border-amber-800/50">
                    <ShieldCheck className="w-3 h-3" />
                    {t.admin}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{currentUser.email}</p>
            </div>
          </div>

          {/* Secure Sign Out from Device */}
          <button
            onClick={() => {
              if (confirm(t.signOutConfirm)) {
                signOut();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center gap-1.5 transition-colors active-press cursor-pointer"
            title={t.signOut}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.signOut}</span>
          </button>
        </div>
      </div>

      {/* Family Security Passcode Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm transition-colors space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
            <span>{t.passcodeSettingsTitle}</span>
          </span>
          <span className="text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 tracking-wider">
            {family.passcode || 'BMOBIL2026'}
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {t.passcodeSettingsDesc}
        </p>
      </div>

      {/* Language / Sprache Selector */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm transition-colors">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-2.5 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#0a84ff]" />
          <span>{t.language}</span>
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setLanguage('de')}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
              language === 'de'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0071e3] dark:border-[#0a84ff] text-[#0071e3] dark:text-[#0a84ff] shadow-xs'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
            }`}
          >
            <span className="text-base leading-none">🇩🇪</span>
            <span>Deutsch</span>
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0071e3] dark:border-[#0a84ff] text-[#0071e3] dark:text-[#0a84ff] shadow-xs'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
            }`}
          >
            <span className="text-base leading-none">🇬🇧</span>
            <span>English</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Family Invite Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm transition-colors text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200/60 dark:border-emerald-800/50">
          <Share2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.whatsAppInviteTitle}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {t.whatsAppInviteDesc}
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 active-press cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{t.whatsAppInviteBtn}</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-colors active-press cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.copied : `${t.copyCode} (${family.joinCode})`}</span>
          </button>
        </div>
      </div>

      {/* Family Members List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {t.familyMembers} ({allUsers.length})
          </span>
          <button
            onClick={() => setShowAddMember(prev => !prev)}
            className="text-xs text-[#0071e3] dark:text-[#0a84ff] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addMember}</span>
          </button>
        </div>

        {/* Add Member Form Drawer */}
        {showAddMember && (
          <form onSubmit={handleAddMember} className="mb-3 p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2.5">
            <div>
              <input
                type="text"
                placeholder={t.memberNamePlaceholder}
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-medium">{t.badgeColor}</span>
              <div className="flex items-center gap-1.5">
                {colors.map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setNewMemberColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${
                      newMemberColor === c ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="px-2.5 py-1 rounded-lg text-xs text-zinc-500 hover:text-zinc-800 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                {t.saveMember}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-1.5">
          {allUsers.map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-7 h-7 rounded-xl text-xs font-bold text-white flex items-center justify-center shadow-2xs"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0)}
                </span>
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">{user.name}</span>
                  <span className="text-[10px] text-zinc-400">{user.email}</span>
                </div>
              </div>

              {user.role === 'admin' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-semibold border border-amber-200 dark:border-amber-800/40">
                  <ShieldCheck className="w-3 h-3" />
                  {t.admin}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Clean Test Data & Start Fresh */}
      <div className="pt-2 flex items-center justify-between text-xs px-1 text-zinc-500">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-[200px]">{t.cleanTestDataDesc}</span>
        <button
          onClick={() => {
            if (confirm(t.cleanTestConfirm)) {
              clearTestDataAndStartFresh();
            }
          }}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors active-press cursor-pointer font-semibold text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.cleanTestData}</span>
        </button>
      </div>
    </div>
  );
};
