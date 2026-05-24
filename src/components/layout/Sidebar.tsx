'use client';

import React from 'react';
import { useAcademicStore } from '../../store/academicStore';
import { getRoleBadgeStyles } from './Header';
import { 
  LayoutDashboard, 
  Columns, 
  CalendarRange, 
  FileSpreadsheet, 
  Users, 
  CircleDot, 
  Microscope 
} from 'lucide-react';

export default function Sidebar() {
  const { currentUser, currentView, setCurrentView, users } = useAcademicStore();

  if (!currentUser) return null;
  const menuItems = [
    { id: 'DASHBOARD' as const, label: 'Supervision Dashboard', icon: LayoutDashboard },
    { id: 'ADMIN' as const, label: 'Lab Roster & Admin', icon: Users },
    { id: 'KANBAN' as const, label: 'Academic Board', icon: Columns },
    { id: 'CALENDAR' as const, label: 'Calendar', icon: CalendarRange },
    { id: 'LOGISTICS' as const, label: 'Lab Assets & Logs', icon: FileSpreadsheet }
  ];

  return (
    <aside className="w-56 border-r border-[var(--border-primary)] bg-[var(--bg-primary)] flex flex-col justify-between z-20 shrink-0 select-none transition-all duration-200">
      <div className="flex-1 py-3 px-2.5 space-y-4 overflow-y-auto">
        {/* Active Profile Info */}
        <div className="px-2 py-1.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-primary)] transition-all duration-200">
          <span className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold block font-mono">
            Current Workspace
          </span>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-7 h-7 rounded bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center font-bold text-xs text-[var(--accent)] uppercase shrink-0">
              {currentUser.role.substring(0, 2)}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                {currentUser.name.split(' ').slice(1).join(' ') || currentUser.name}
              </span>
              <span className="text-[9px] text-[var(--text-tertiary)] block truncate leading-tight mt-0.5">
                {currentUser.email}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div>
          <span className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold px-2 block mb-1 font-mono">
            Navigation
          </span>
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              const highlightClass = isActive
                ? 'bg-[var(--accent-bg)] text-[var(--accent)] border-l-2 border-[var(--accent)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]';

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded transition-all text-left ${highlightClass}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lab Roster Quick Panel */}
        <div className="pt-2 border-t border-[var(--border-primary)] transition-all duration-200">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold font-mono">
              Lab Roster ({users.length})
            </span>
            <Users className="w-3 h-3 text-[var(--text-tertiary)]" />
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {users.map((member) => {
              const roleStyles = getRoleBadgeStyles(member.role);
              const isSelf = member.id === currentUser.id;
              
              return (
                <div
                  key={member.id}
                  className={`px-2 py-1 rounded flex items-center justify-between text-[11px] group transition-all duration-150 ${
                    isSelf ? 'bg-[var(--bg-secondary)] border border-[var(--border-primary)]/40' : 'hover:bg-[var(--bg-secondary)] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CircleDot className={`w-1.5 h-1.5 shrink-0 ${roleStyles.dot.replace('bg-', 'text-')}`} />
                    <span className={`truncate ${isSelf ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {member.name.split(' ').pop()}
                    </span>
                    {isSelf && <span className="text-[8px] text-[var(--text-tertiary)] italic shrink-0 ml-0.5">(you)</span>}
                  </div>
                  <span className="text-[9px] text-[var(--text-tertiary)] scale-90 origin-right">
                    {member.role === 'PHD_STUDENT' && 'PhD'}
                    {member.role === 'MASTER_STUDENT' && 'M.Sc.'}
                    {member.role === 'BACHELOR_STUDENT' && 'B.Sc.'}
                    {member.role === 'POSTDOC' && 'Postdoc'}
                    {member.role === 'PI' && 'PI'}
                    {member.role === 'LAB_ASSISTANT' && 'Ops'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-3 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] text-center flex flex-col gap-1 shrink-0 transition-all duration-200">
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-secondary)]">
          <Microscope className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="font-semibold text-[var(--text-secondary)]">Pendelton Geo-Lab</span>
        </div>
        <span className="text-[8px] text-[var(--text-tertiary)] block font-mono">
          Academic PM v1.0.0
        </span>
      </div>
    </aside>
  );
}
