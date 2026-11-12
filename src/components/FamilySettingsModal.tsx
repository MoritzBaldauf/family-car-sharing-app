import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Users, Share2, Copy, Check, RotateCcw, ShieldCheck, Flame, Plus } from 'lucide-react';
import { isFirebaseConfigured } from '../lib/firebase';

interface FamilySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilySettingsModal: React.FC<FamilySettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    family,
    allUsers,
    addFamilyMember,
    resetToSampleData
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberColor, setNewMemberColor] = useState('#8b5cf6');

  if (!isOpen) return null;

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
    const text = `Join our family car sharing app! Use code: ${family.joinCode} or tap: ${joinLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    addFamilyMember(
      newMemberName.trim(),
      newMemberEmail.trim() || `${newMemberName.toLowerCase().replace(/\s+/g, '')}@family.local`,
      newMemberColor
    );
    setNewMemberName('');
    setNewMemberEmail('');
    setShowAddMember(false);
  };

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Family & Settings</h3>
              <p className="text-xs text-slate-400">{family.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Join Code Card */}
        <div className="bg-gradient-to-br from-indigo-950/60 to-slate-800/80 border border-indigo-500/30 rounded-2xl p-4 text-center space-y-3">
          <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold">
            Family Invite Code
          </span>
          <div className="text-3xl font-mono font-extrabold tracking-widest text-white">
            {family.joinCode}
          </div>
          <p className="text-xs text-slate-300">
            Share this code or link with family members so they can join our car.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCopyCode}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Family Members List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Family Members ({allUsers.length})
            </h4>
            <button
              onClick={() => setShowAddMember(prev => !prev)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          {showAddMember && (
            <form onSubmit={handleAddMember} className="mb-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2.5">
              <div>
                <input
                  type="text"
                  placeholder="Member Name (e.g. Leo)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Color:</span>
                <div className="flex items-center gap-1.5">
                  {colors.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewMemberColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${
                        newMemberColor === c ? 'border-white scale-110' : 'border-transparent'
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
                  className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow"
                >
                  Save Member
                </button>
              </div>
            </form>
          )}

          <div className="space-y-1.5">
            {allUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-xl border border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-7 h-7 rounded-xl text-xs font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0)}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-white block">{user.name}</span>
                    <span className="text-[10px] text-slate-400">{user.email}</span>
                  </div>
                </div>

                {user.role === 'admin' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[10px] font-semibold border border-amber-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cloud Sync / Firebase Status */}
        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Backend Sync Status</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isFirebaseConfigured
              ? '✅ Connected to Google Firebase Cloud Firestore.'
              : '⚡ Running in Instant Demo & Multi-Tab Real-Time Sync Mode. To connect your live Firebase project, provide your credentials in .env.'}
          </p>
        </div>

        {/* Demo Reset */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">Need to restore seed data?</span>
          <button
            onClick={() => {
              if (confirm('Reset sample family data?')) {
                resetToSampleData();
                onClose();
              }
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
