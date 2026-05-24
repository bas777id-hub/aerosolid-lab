'use client';

import React, { useState } from 'react';
import { useAcademicStore } from '../../store/academicStore';
import { UserRole } from '../../types/academic';
import { 
  Shield, 
  ChevronDown, 
  FlaskConical, 
  LogOut, 
  Settings, 
  User, 
  X, 
  Check,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

export const getRoleBadgeStyles = (role: UserRole) => {
  switch (role) {
    case 'PI':
      return {
        bg: 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/30',
        label: 'PI / Director',
        dot: 'bg-amber-500'
      };
    case 'POSTDOC':
      return {
        bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
        label: 'Postdoc Researcher',
        dot: 'bg-purple-500'
      };
    case 'PHD_STUDENT':
      return {
        bg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
        label: 'PhD Candidate',
        dot: 'bg-indigo-500'
      };
    case 'MASTER_STUDENT':
      return {
        bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
        label: 'M.Sc. Student',
        dot: 'bg-blue-500'
      };
    case 'BACHELOR_STUDENT':
      return {
        bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        label: 'B.Sc. Student',
        dot: 'bg-emerald-500'
      };
    case 'LAB_ASSISTANT':
      return {
        bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
        label: 'Lab Operations',
        dot: 'bg-rose-500'
      };
    default:
      return {
        bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30',
        label: 'Guest',
        dot: 'bg-slate-500'
      };
  }
};

export default function Header() {
  const { currentUser, users, setCurrentUser, logout, updateUserProfile, theme, setTheme, fontSizeMultiplier, setFontSizeMultiplier } = useAcademicStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Profile Form States
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [thesisTitle, setThesisTitle] = useState(currentUser?.thesisTitle || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!currentUser) return null;

  const activeRoleInfo = getRoleBadgeStyles(currentUser.role);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(fullName, email, password || undefined, thesisTitle || undefined);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setProfileModalOpen(false);
      setPassword('');
    }, 1200);
  };

  const openProfileModal = () => {
    setFullName(currentUser.name);
    setEmail(currentUser.email);
    setThesisTitle(currentUser.thesisTitle || '');
    setPassword('');
    setDropdownOpen(false);
    setProfileModalOpen(true);
  };

  return (
    <header className="h-12 border-b border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 flex items-center justify-between z-30 sticky top-0 transition-all duration-200">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="bg-[var(--accent)] p-1 rounded">
          <FlaskConical className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-bold tracking-tight text-sm text-[var(--text-primary)]">AEROSOLID</span>
          <span className="text-[10px] text-[var(--accent)] font-medium block -mt-1 uppercase tracking-widest font-mono">LAB PORTAL</span>
        </div>
      </div>


      {/* Lab Stats Quick Bar */}
      <div className="hidden md:flex items-center gap-6 text-[11px] text-[var(--text-secondary)] border-x border-[var(--border-primary)] px-6 h-full transition-all duration-200">
        <div>
          <span className="text-[var(--text-tertiary)]">Supervision:</span>{' '}
          <span className="font-semibold text-[var(--text-secondary)]">5 Students</span>
        </div>
        <div>
          <span className="text-[var(--text-tertiary)]">Active Grants:</span>{' '}
          <span className="font-semibold text-[var(--text-secondary)]">NSF-ENV-26</span>
        </div>
        <div>
          <span className="text-[var(--text-tertiary)]">Lab Status:</span>{' '}
          <span className="text-emerald-555 font-semibold flex items-center gap-1 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Nominal
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Font Size Controller */}
        <div className="flex items-center bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded p-0.5 text-xs text-[var(--text-secondary)] transition-colors duration-200">
          <button
            onClick={() => setFontSizeMultiplier(Math.max(0.7, fontSizeMultiplier - 0.1))}
            className="px-1.5 py-0.5 rounded hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-all font-semibold cursor-pointer"
            title="Decrease Text Size"
          >
            A-
          </button>
          <span className="px-1.5 text-[9px] font-bold font-mono min-w-[34px] text-center select-none text-[var(--text-primary)]">
            {Math.round(fontSizeMultiplier * 100)}%
          </span>
          <button
            onClick={() => setFontSizeMultiplier(Math.min(1.5, fontSizeMultiplier + 0.1))}
            className="px-1.5 py-0.5 rounded hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-all font-semibold cursor-pointer"
            title="Increase Text Size"
          >
            A+
          </button>
        </div>

        {/* Theme Selector (Custom CSS Variables with localStorage) */}
        <div className="flex items-center bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded p-0.5 transition-colors duration-200">
          <button
            onClick={() => setTheme('light')}
            className={`p-1 rounded transition-colors ${theme === 'light' ? 'bg-[var(--bg-primary)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
            title="Light Theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1 rounded transition-colors ${theme === 'dark' ? 'bg-[var(--bg-primary)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
            title="Dark Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1 rounded transition-colors ${theme === 'system' ? 'bg-[var(--bg-primary)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
            title="System Preference"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Switching / Settings Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-all text-left text-xs text-[var(--text-primary)]"
          >
            <div className="w-5 h-5 rounded bg-[var(--accent-bg)] border border-[var(--accent)]/30 flex items-center justify-center font-bold text-[10px] text-[var(--accent)] uppercase shrink-0">
              {currentUser.name.split(' ').pop()?.substring(0, 2)}
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold leading-none text-[var(--text-primary)] flex items-center gap-1.5">
                {currentUser.name}
                <ChevronDown className="w-3 h-3 text-[var(--text-tertiary)]" />
              </div>
              <div className="text-[9px] text-[var(--text-tertiary)] leading-none mt-0.5 flex items-center gap-1">
                <span className={`w-1 h-1 rounded-full ${activeRoleInfo.dot}`} />
                {activeRoleInfo.label}
              </div>
            </div>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-64 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded shadow-2xl z-50 overflow-hidden py-1 glow-accent transition-all duration-200">
                {/* Account Operations */}
                <div className="p-1 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-0.5">
                  <button 
                    onClick={openProfileModal}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[var(--bg-tertiary)] transition-colors text-xs text-[var(--text-primary)] flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                    Profile Settings
                  </button>
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-500/10 hover:text-red-500 transition-colors text-xs text-[var(--text-primary)] flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    Sign Out
                  </button>
                </div>

                <div className="px-3 py-1.5 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                  <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest block font-mono">
                    Sandbox Switcher
                  </span>
                  <p className="text-[9px] text-[var(--text-secondary)] leading-tight mt-0.5">
                    Instantly swap accounts to verify authorization checks:
                  </p>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {users.map((user) => {
                    const uStyles = getRoleBadgeStyles(user.role);
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          setCurrentUser(user.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-start gap-2 hover:bg-[var(--bg-secondary)] transition-colors ${
                          isSelected ? 'bg-[var(--accent-bg)] border-l-2 border-[var(--accent)]' : ''
                        }`}
                      >
                        <div className="w-5 h-5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex items-center justify-center font-bold text-[9px] text-[var(--text-secondary)] uppercase shrink-0 mt-0.5">
                          {user.name.split(' ').pop()?.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                            {user.name}
                            {isSelected && (
                              <span className="text-[7px] bg-[var(--accent-bg)] text-[var(--accent)] px-0.5 rounded border border-[var(--accent)]/30">
                                active
                              </span>
                            )}
                          </div>
                          <span className={`inline-block text-[8px] border font-bold px-0.5 rounded ${uStyles.bg}`}>
                            {uStyles.label.split(' ')[0]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile Settings Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg max-w-sm w-full p-4 shadow-2xl relative glow-accent animate-in fade-in duration-200">
            <button 
              onClick={() => setProfileModalOpen(false)}
              className="absolute right-3 top-3 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4.5 h-4.5 text-[var(--accent)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Profile Settings</h3>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Password</label>
                <input 
                  type="password" 
                  placeholder="•••••••• (Leave blank to keep unchanged)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              {currentUser.role.includes('STUDENT') && (
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Thesis Title</label>
                  <textarea 
                    value={thesisTitle}
                    onChange={(e) => setThesisTitle(e.target.value)}
                    rows={2}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2 border-t border-[var(--border-primary)]">
                <button 
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] rounded text-xs transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saveSuccess}
                  className="px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Saved
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
