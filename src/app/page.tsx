'use client';

import React, { useEffect, useState } from 'react';
import { useAcademicStore } from '../store/academicStore';
import Header, { getRoleBadgeStyles } from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Board from '../components/kanban/Board';
import PiDashboard from '../components/dashboard/PiDashboard';
import AcademicCalendar from '../components/calendar/AcademicCalendar';
import { User, UserRole } from '../types/academic';
import { 
  ShieldCheck, 
  UserCheck, 
  FlaskConical, 
  Calendar, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Inbox,
  Columns,
  UserPlus,
  Trash2,
  Edit2,
  X,
  Plus,
  Mail,
  User as UserIcon,
  BookOpen,
  KeyRound,
  Fingerprint,
  Video,
  ExternalLink
} from 'lucide-react';

export default function Home() {
  const { 
    currentUser, 
    currentView, 
    cards, 
    studentTracks, 
    researchActivities, 
    isAuthenticated, 
    login, 
    users,
    inviteUser,
    updateUser,
    deleteUser,
    authError,
    theme,
    setTheme,
    setFontSizeMultiplier,
    personalTasks,
    loadPersonalTasks,
    addPersonalTask,
    togglePersonalTask,
    deletePersonalTask,
    updatePersonalTask
  } = useAcademicStore();

  // Load saved theme, font size and personal tasks from localStorage on mount
  useEffect(() => {
    loadPersonalTasks();
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('aura-theme') as 'light' | 'dark' | 'system' | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        setTheme('system');
      }

      const savedMultiplier = localStorage.getItem('aura-font-size-multiplier');
      if (savedMultiplier) {
        setFontSizeMultiplier(parseFloat(savedMultiplier));
      } else {
        setFontSizeMultiplier(1.0);
      }
    }
  }, [setTheme, setFontSizeMultiplier, loadPersonalTasks]);

  const roleStyles = currentUser ? getRoleBadgeStyles(currentUser.role) : null;

  // Login Form States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  // Add User Form States
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('BACHELOR_STUDENT');
  const [newUserThesis, setNewUserThesis] = useState('');
  const [newUserAdvisor, setNewUserAdvisor] = useState('u-pi');

  // Personal Task Form States
  const [editingPersonalTaskId, setEditingPersonalTaskId] = useState<string | null>(null);
  const [editPersonalTitle, setEditPersonalTitle] = useState('');
  const [editPersonalDate, setEditPersonalDate] = useState('');
  const [editPersonalNotes, setEditPersonalNotes] = useState('');
  
  const [newPersonalTitle, setNewPersonalTitle] = useState('');
  const [newPersonalDate, setNewPersonalDate] = useState('');
  const [newPersonalNotes, setNewPersonalNotes] = useState('');

  // Edit User Form States
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState('');
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('BACHELOR_STUDENT');
  const [editUserThesis, setEditUserThesis] = useState('');
  const [editUserAdvisor, setEditUserAdvisor] = useState('u-pi');
  const [activeAdminTab, setActiveAdminTab] = useState<'ROSTER' | 'ACCOUNTS' | 'SETTINGS'>('ROSTER');
  const [labGrant, setLabGrant] = useState('NSF-ENV-26');
  const [labStatus, setLabStatus] = useState('Nominal');
  const [semesterWindow, setSemesterWindow] = useState('Semester Genap 2026');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(emailInput, passwordInput);
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setEmailInput(email);
    setPasswordInput(pass);
    login(email, pass);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      thesisTitle: newUserRole.includes('STUDENT') ? newUserThesis : undefined,
      advisorId: newUserRole.includes('STUDENT') ? newUserAdvisor : undefined,
      avatarUrl: `/avatars/${newUserRole.toLowerCase().split('_')[0]}.png`
    });
    setNewUserName('');
    setNewUserEmail('');
    setNewUserThesis('');
    setNewUserRole('BACHELOR_STUDENT');
    setAddUserModalOpen(false);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role);
    setEditUserThesis(user.thesisTitle || '');
    setEditUserAdvisor(user.advisorId || 'u-pi');
    setEditUserModalOpen(true);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(editingUserId, {
      name: editUserName,
      email: editUserEmail,
      role: editUserRole,
      thesisTitle: editUserRole.includes('STUDENT') ? editUserThesis : undefined,
      advisorId: editUserRole.includes('STUDENT') ? editUserAdvisor : undefined
    });
    setEditUserModalOpen(false);
  };

  const isStaff = currentUser?.role === 'PI' || currentUser?.role === 'POSTDOC';
  const myCards = currentUser
    ? Object.values(cards).filter((c) => isStaff || c.assigneeId === currentUser.id)
    : [];

  // RENDER LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-950/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-550/5 dark:bg-purple-950/10 rounded-full blur-3xl" />

        <div className="max-w-md w-full z-10 space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex bg-[var(--accent)] p-2.5 rounded-lg shadow-lg mb-2 text-white glow-accent">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">AEROSOLID LAB Portal</h1>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto text-container-max">
              Academic Unified Research & Advisor project manager specifically built for academic lab hierarchies.
            </p>
          </div>

          {/* Login Card */}
          <div className="glass-panel p-6 rounded-xl shadow-2xl glow-accent">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-1">
                  Lab Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    placeholder="name@university.edu"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded py-1.5 pl-8 pr-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    placeholder="Enter password (lowercase last name)"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded py-1.5 pl-8 pr-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              {authError && (
                <div className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-500 p-2 rounded">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded font-semibold text-xs tracking-wide transition-all shadow-md cursor-pointer"
              >
                Sign In to Portal
              </button>
            </form>
          </div>

          {/* Quick Prototype Login Helper */}
          <div className="glass-panel p-4 rounded-xl">
            <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest block mb-2 font-mono flex items-center gap-1">
              <Fingerprint className="w-3.5 h-3.5 text-[var(--accent)]" /> Prototype Credentials Bypass
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {users.slice(0, 6).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u.email, u.password || '')}
                  className="bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[10px] text-[var(--text-secondary)] p-2 rounded transition-all text-left flex flex-col justify-between shrink-0"
                >
                  <span className="font-bold text-[var(--text-primary)] truncate block">{u.name.split(' ').pop()}</span>
                  <span className="text-[8px] text-[var(--text-tertiary)] block mt-0.5">Password: {u.password}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Dynamic View Panel */}
        <main className="flex-1 overflow-y-auto bg-[var(--bg-secondary)] p-4 transition-colors duration-200">
          {/* Active View Header */}
          <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-[var(--border-primary)]">
            <div>
              <span className="text-[10px] text-[var(--accent)] uppercase tracking-widest font-semibold font-mono">
                Simulated Sandbox Portal
              </span>
              <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)] mt-0.5">
                {currentView === 'DASHBOARD' && 'Lab Supervision & Project Dashboard'}
                {currentView === 'ADMIN' && 'Lab Roster & Account Administration'}
                {currentView === 'KANBAN' && 'Academic Kanban Board'}
                {currentView === 'CALENDAR' && 'Academic Calendar'}
                {currentView === 'LOGISTICS' && 'Lab Logistics & Equipment Logs'}
              </h1>
            </div>
            
            {/* Context Notice Badge */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-[var(--text-secondary)]">Authorized:</span>
              <span className={`font-semibold ${roleStyles?.bg.split(' ')[1]} border-none px-0`}>
                {roleStyles?.label}
              </span>
            </div>
          </div>

          {/* Render Active View */}
          {currentView === 'DASHBOARD' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Left & Middle Column (Lab Overview & Active Student Matrix) */}
              <div className="xl:col-span-2 space-y-4">
                {/* Persona Summary Card */}
                <div className="glass-panel p-4 rounded-lg glow-accent">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-[var(--text-primary)]">
                        Welcome back, {currentUser.name}
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)] mt-1.5 text-container-max leading-relaxed">
                        You are currently simulating the <strong className="text-[var(--text-primary)]">{currentUser.role}</strong> persona.
                        The system has dynamically toggled all authorization locks, dashboards, timelines, and alert structures to reflect your hierarchy level.
                      </p>
                    </div>
                    <span className={`text-[10px] font-mono border px-1.5 py-0.5 rounded ${roleStyles?.bg}`}>
                      {currentUser.role}
                    </span>
                  </div>

                  {/* Permission Guardrail Visual Panel */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-4 border-t border-[var(--border-primary)]">
                    <div className="bg-[var(--bg-secondary)] p-2.5 rounded border border-[var(--border-primary)] flex gap-2">
                      <Lock className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-[var(--text-primary)] font-bold block font-mono">Approval Gate Override</span>
                        <p className="text-[9px] text-[var(--text-secondary)] leading-snug mt-0.5">
                          {isStaff 
                            ? 'Authorized. You can manually approve manuscript drafts and bypass column blocks.' 
                            : 'Access Denied. Manuscript drafts require PI or Postdoc signatures to exit Review/Approved.'}
                        </p>
                      </div>
                    </div>
                    <div className="bg-[var(--bg-secondary)] p-2.5 rounded border border-[var(--border-primary)] flex gap-2">
                      <UserCheck className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-[var(--text-primary)] font-bold block font-mono">Board Autonomy Scope</span>
                        <p className="text-[9px] text-[var(--text-secondary)] leading-snug mt-0.5">
                          {currentUser.role === 'PI' && 'Global: Supervise all student boards, logs, and defense timelines.'}
                          {currentUser.role === 'POSTDOC' && 'Co-supervisory: Autonomy over student boards + edit privileges.'}
                          {currentUser.role === 'LAB_ASSISTANT' && 'Operational: Autonomy over lab scheduling & inventory.'}
                          {currentUser.role.includes('STUDENT') && 'Personal: Authorized to view/edit only your assigned tasks.'}
                        </p>
                      </div>
                    </div>
                    <div className="bg-[var(--bg-secondary)] p-2.5 rounded border border-[var(--border-primary)] flex gap-2">
                      <TrendingUp className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-[var(--text-primary)] font-bold block font-mono">Milestone Tracking View</span>
                        <p className="text-[9px] text-[var(--text-secondary)] leading-snug mt-0.5">
                          {currentUser.role === 'PI' ? 'Global supervisor matrix comparing all candidate timelines.' : 'Individual student progress seminars & graduation calendar.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PI Master Dashboard View (Restricted to PI/Postdocs) */}
                {isStaff && <PiDashboard />}

                {/* Account & Roster Management Console (Restricted to PI/Postdocs) */}


                {/* Simulated Data Status for Current Persona */}
                <div className="glass-panel p-4 rounded-lg">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest mb-3.5 font-mono">
                    Active Tasks & Deliverables ({myCards.length})
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {myCards.length === 0 ? (
                      <div className="text-center py-6 text-[var(--text-tertiary)] text-xs">
                        <Inbox className="w-8 h-8 mx-auto mb-2 text-[var(--text-tertiary)] opacity-60" />
                        No active tasks assigned.
                      </div>
                    ) : (
                      myCards.map((card) => {
                        const assignee = card.assigneeId === 'u-bachelor-ethan' ? 'Ethan Hunt (Bachelor)' :
                                          card.assigneeId === 'u-master-diana' ? 'Diana Prince (Master)' :
                                          card.assigneeId === 'u-phd-carl' ? 'Carl Sagan (PhD)' : 'Staff';
                        return (
                          <div 
                            key={card.id}
                            className="bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] rounded p-2.5 transition-all flex items-start justify-between gap-3 text-xs shadow-sm"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[8px] font-bold px-1 py-0.2 rounded border ${
                                  card.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/25 glow-rose' :
                                  card.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border-amber-500/25' :
                                  'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)]'
                                }`}>
                                  {card.priority}
                                </span>
                                <span className="text-[9px] bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)] px-1 py-0.2 rounded">
                                  {card.category.replace('_', ' ')}
                                </span>
                              </div>
                              <h4 className="font-bold text-[var(--text-primary)] truncate">{card.title}</h4>
                              <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">{card.summary}</p>
                              
                              {/* External Artifact Links Preview */}
                              <div className="flex items-center gap-2.5 pt-1 text-[10px] text-[var(--accent)] font-semibold">
                                {card.artifactLinks.overleaf && (
                                  <a href={card.artifactLinks.overleaf} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    Overleaf
                                  </a>
                                )}
                                {card.artifactLinks.gitHub && (
                                  <a href={card.artifactLinks.gitHub} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    GitHub
                                  </a>
                                )}
                                {card.artifactLinks.googleDrive && (
                                  <a href={card.artifactLinks.googleDrive} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    Drive Folder
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                              <span className="text-[10px] text-[var(--text-tertiary)]">
                                {card.dueDate ? `Due: ${card.dueDate}` : 'No due date'}
                              </span>
                              <span className="text-[10px] text-[var(--text-tertiary)]">
                                Assignee: {assignee}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5">
                                {card.isApproved ? (
                                  <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1 border border-emerald-555 rounded flex items-center gap-0.5">
                                    <CheckCircle2 className="w-2 h-2" /> PI Approved
                                  </span>
                                ) : card.approvalRequested ? (
                                  <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1 border border-amber-555 rounded flex items-center gap-0.5 animate-pulse">
                                    Pending Approval
                                  </span>
                                ) : (
                                  <span className="text-[8px] bg-[var(--bg-secondary)] text-[var(--text-tertiary)] px-1 border border-[var(--border-primary)] rounded">
                                    Active Draft
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Personal Checklist & Tasks Widget */}
                <div className="glass-panel p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-[var(--border-primary)]">
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest font-mono">
                        Personal Task List & Assignments
                      </h3>
                      <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">
                        Private workspace todo list for managing your own daily tasks and lab assignments.
                      </p>
                    </div>
                  </div>

                  {/* Add Task Form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newPersonalTitle.trim()) return;
                      addPersonalTask(newPersonalTitle, newPersonalDate, newPersonalNotes);
                      setNewPersonalTitle('');
                      setNewPersonalDate('');
                      setNewPersonalNotes('');
                    }}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-2.5 rounded mb-3 space-y-2 text-xs"
                  >
                    <span className="text-[9px] uppercase font-bold text-[var(--text-tertiary)] block font-mono">Add Personal Task</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Task title (e.g. Prep slides for Friday meeting)"
                          value={newPersonalTitle}
                          onChange={(e) => setNewPersonalTitle(e.target.value)}
                          required
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="date"
                          value={newPersonalDate}
                          onChange={(e) => setNewPersonalDate(e.target.value)}
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add optional task notes..."
                        value={newPersonalNotes}
                        onChange={(e) => setNewPersonalNotes(e.target.value)}
                        className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[10px] font-bold px-3 py-1 rounded transition-all cursor-pointer shadow-xs"
                      >
                        Add Task
                      </button>
                    </div>
                  </form>

                  {/* Task List */}
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {personalTasks.filter(t => t.userId === currentUser.id).length === 0 ? (
                      <div className="text-center py-6 text-[var(--text-tertiary)] text-[10px] italic">
                        No personal tasks added. Use the form above to add items to your checklist.
                      </div>
                    ) : (
                      personalTasks
                        .filter(t => t.userId === currentUser.id)
                        .map((t) => {
                          const isEditing = editingPersonalTaskId === t.id;
                          return (
                            <div 
                              key={t.id}
                              className={`p-2.5 rounded border transition-all ${
                                t.completed 
                                  ? 'bg-[var(--bg-secondary)]/50 border-[var(--border-primary)]/50 opacity-60' 
                                  : 'bg-[var(--bg-primary)] border-[var(--border-primary)] hover:border-[var(--border-secondary)] shadow-xs'
                              }`}
                            >
                              {isEditing ? (
                                <form 
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    updatePersonalTask(t.id, editPersonalTitle, editPersonalDate, editPersonalNotes);
                                    setEditingPersonalTaskId(null);
                                  }}
                                  className="space-y-2 text-xs"
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div className="sm:col-span-2">
                                      <input
                                        type="text"
                                        value={editPersonalTitle}
                                        onChange={(e) => setEditPersonalTitle(e.target.value)}
                                        required
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <input
                                        type="date"
                                        value={editPersonalDate}
                                        onChange={(e) => setEditPersonalDate(e.target.value)}
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={editPersonalNotes}
                                      onChange={(e) => setEditPersonalNotes(e.target.value)}
                                      placeholder="Edit notes..."
                                      className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none"
                                    />
                                    <button
                                      type="submit"
                                      className="bg-emerald-650 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingPersonalTaskId(null)}
                                      className="bg-[var(--bg-tertiary)] border hover:bg-[var(--border-secondary)] text-[var(--text-secondary)] px-2.5 py-1 rounded text-[10px] cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <div className="flex items-start gap-2.5 justify-between">
                                  <div className="flex items-start gap-2 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={t.completed}
                                      onChange={() => togglePersonalTask(t.id)}
                                      className="mt-1 cursor-pointer accent-[var(--accent)] w-3.5 h-3.5 shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <span className={`text-xs font-bold block ${t.completed ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}>
                                        {t.title}
                                      </span>
                                      {t.notes && (
                                        <p className="text-[10.5px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                                          {t.notes}
                                        </p>
                                      )}
                                      {t.dueDate && (
                                        <span className="inline-block mt-1 text-[8.5px] font-bold font-mono px-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-[var(--border-primary)]">
                                          Due: {t.dueDate}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 font-sans">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingPersonalTaskId(t.id);
                                        setEditPersonalTitle(t.title);
                                        setEditPersonalDate(t.dueDate || '');
                                        setEditPersonalNotes(t.notes || '');
                                      }}
                                      className="p-1 hover:bg-[var(--bg-secondary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                                      title="Edit Task"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deletePersonalTask(t.id)}
                                      className="p-1 hover:bg-[var(--bg-secondary)] rounded text-[var(--text-secondary)] hover:text-red-500 cursor-pointer"
                                      title="Delete Task"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar Widget (Milestone Progression) */}
              <div className="space-y-4">
                {/* Thesis details for student roles */}
                {!isStaff && currentUser.thesisTitle && (
                  <div className="glass-panel p-4 rounded-lg">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold block font-mono">
                      My Thesis Metadata
                    </span>
                    <div className="mt-2.5 space-y-1.5 text-xs">
                      <div>
                        <span className="text-[var(--text-tertiary)] block text-[10px]">Title:</span>
                        <span className="text-[var(--text-primary)] font-bold leading-tight block text-container-max">
                          {currentUser.thesisTitle}
                        </span>
                      </div>
                      <div className="pt-1.5 flex justify-between">
                        <div>
                          <span className="text-[var(--text-tertiary)] block text-[10px]">Supervisor:</span>
                          <span className="text-[var(--text-secondary)] font-medium">
                            {currentUser.advisorId === 'u-pi' ? 'Prof. Pendelton' : 'Dr. Beatrice Vance'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-tertiary)] block text-[10px]">Joined Date:</span>
                          <span className="text-[var(--text-secondary)]">{currentUser.joinedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Milestone Tracks Widget */}
                <div className="glass-panel p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest font-mono">
                      Milestone Tracks
                    </h3>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">GRCh38 Ref</span>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.values(studentTracks).map((track) => {
                      const student = users.find(u => u.id === track.studentId);
                      if (!student) return null;
                      
                      const studentName = `${student.name} (${student.role === 'BACHELOR_STUDENT' ? 'B.Sc.' : student.role === 'MASTER_STUDENT' ? 'M.Sc.' : 'PhD'})`;
                      const isStudentSelf = currentUser.id === track.studentId;
                      const completedCount = track.milestones.filter(m => m.status === 'APPROVED').length;
                      const totalCount = track.milestones.length;
                      
                      return (
                        <div 
                          key={track.id}
                          className={`p-2.5 rounded border transition-all ${
                            isStudentSelf 
                              ? 'bg-[var(--accent-bg)] border-[var(--accent)]/40 glow-accent' 
                              : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-[var(--text-primary)] truncate max-w-[160px]">{studentName}</span>
                            <span className={`text-[9px] px-1 rounded font-bold ${
                              track.overallStatus === 'CRITICAL_STAGNATION' ? 'bg-red-500/10 text-red-500 border border-red-500/25 glow-rose' :
                              track.overallStatus === 'AT_RISK' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25' :
                              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                            }`}>
                              {track.overallStatus.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mb-2">
                            <div 
                              className={`h-full ${
                                track.overallStatus === 'CRITICAL_STAGNATION' ? 'bg-red-500' :
                                track.overallStatus === 'AT_RISK' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
                            <span>
                              {completedCount}/{totalCount} Passed
                            </span>
                            <span className="text-[var(--text-tertiary)]">
                              {track.targetGraduationWindow}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Calendar quick activities */}
                <div className="glass-panel p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest font-mono">
                      Upcoming Deadlines
                    </h3>
                    <Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  </div>
                  <div className="space-y-2">
                    {researchActivities.slice(0, 3).map((act) => (
                      <div key={act.id} className="bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-primary)] text-xs shadow-sm space-y-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-[var(--text-primary)] truncate max-w-[150px]">{act.title}</span>
                          <span className="text-[9px] bg-[var(--bg-secondary)] px-1 py-0.2 text-[var(--accent)] rounded font-semibold">
                            {act.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)] flex items-center justify-between mt-1">
                          <span>{act.date}</span>
                          <span>{act.startTime} - {act.endTime}</span>
                        </div>
                        
                        {/* Zoom Details inside Dashboard Card */}
                        {act.zoomMeeting && (
                          <div className="mt-1.5 pt-1.5 border-t border-[var(--border-primary)]/40 flex flex-col gap-1 text-[9.5px]">
                            <div className="flex items-center gap-1 text-[var(--accent)] font-semibold">
                              <Video className="w-3 h-3 text-[var(--accent)] shrink-0" />
                              <a 
                                href={act.zoomMeeting.joinUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center gap-0.5"
                              >
                                Join Zoom Meeting <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                            <div className="text-[8.5px] text-[var(--text-tertiary)] font-mono">
                              ID: {act.zoomMeeting.meetingId} • Passcode: {act.zoomMeeting.passcode}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'ADMIN' && (
            <div className="glass-panel p-4 rounded-lg space-y-4 animate-in fade-in duration-200">
              {/* Tab Navigation */}
              <div className="flex border-b border-[var(--border-primary)] pb-1.5 justify-between items-center gap-4 flex-wrap">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveAdminTab('ROSTER')}
                    className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                      activeAdminTab === 'ROSTER'
                        ? 'bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]/30 font-semibold shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    Roster Directory
                  </button>
                  {isStaff && (
                    <>
                      <button
                        onClick={() => setActiveAdminTab('ACCOUNTS')}
                        className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                          activeAdminTab === 'ACCOUNTS'
                            ? 'bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]/30 font-semibold shadow-xs'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        Account Management
                      </button>
                      <button
                        onClick={() => setActiveAdminTab('SETTINGS')}
                        className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                          activeAdminTab === 'SETTINGS'
                            ? 'bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]/30 font-semibold shadow-xs'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        Lab Settings
                      </button>
                    </>
                  )}
                </div>

                {activeAdminTab === 'ACCOUNTS' && isStaff && (
                  <button 
                    onClick={() => setAddUserModalOpen(true)}
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-2.5 py-1 text-[10px] font-bold text-white rounded flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Invite Member
                  </button>
                )}
              </div>

              {/* TAB CONTENT: Roster Directory */}
              {activeAdminTab === 'ROSTER' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest font-mono">
                        Lab Roster Directory
                      </h3>
                      <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">
                        Directory of all active members, roles, and thesis areas within the Pendelton Geo-Lab.
                      </p>
                    </div>
                    {/* Search filter input */}
                    <input
                      type="text"
                      placeholder="Search member or role..."
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] max-w-xs w-full"
                    />
                  </div>

                  <div className="overflow-x-auto border border-[var(--border-primary)] rounded bg-[var(--bg-primary)]/40">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[var(--bg-secondary)]/80 border-b border-[var(--border-primary)] text-[var(--text-secondary)] text-[9px] font-bold uppercase tracking-wider font-mono">
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5">Lab Email</th>
                          <th className="p-2.5">Thesis Focus Area</th>
                          <th className="p-2.5">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-primary)]">
                        {users
                          .filter(u => 
                            u.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
                            u.role.toLowerCase().replace('_', ' ').includes(rosterSearch.toLowerCase()) ||
                            u.email.toLowerCase().includes(rosterSearch.toLowerCase())
                          )
                          .map((member) => {
                            const badge = getRoleBadgeStyles(member.role);
                            return (
                              <tr key={member.id} className="hover:bg-[var(--bg-secondary)]/50 text-[11px] text-[var(--text-secondary)] transition-colors duration-150">
                                <td className="p-2.5 font-bold text-[var(--text-primary)]">{member.name}</td>
                                <td className="p-2.5">
                                  <span className={`text-[8px] font-bold border px-1.5 py-0.2 rounded inline-block ${badge.bg}`}>
                                    {badge.label}
                                  </span>
                                </td>
                                <td className="p-2.5 font-mono text-[10px] text-[var(--text-secondary)]">{member.email}</td>
                                <td className="p-2.5 max-w-[200px] truncate text-[var(--text-secondary)] italic">
                                  {member.thesisTitle || 'N/A'}
                                </td>
                                <td className="p-2.5 text-[10px] text-[var(--text-tertiary)]">{member.joinedDate}</td>
                              </tr>
                            );
                          })}
                        {users.filter(u => 
                          u.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
                          u.role.toLowerCase().replace('_', ' ').includes(rosterSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(rosterSearch.toLowerCase())
                        ).length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-xs text-[var(--text-tertiary)] italic">
                              No lab members match your search criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: Account Management */}
              {activeAdminTab === 'ACCOUNTS' && isStaff && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest font-mono">
                      Lab Account Administration
                    </h3>
                    <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">
                      PI / Postdoc Control: CRUD access to member credentials, password resetting, and account deletion.
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-[var(--border-primary)] rounded bg-[var(--bg-primary)]/40">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[var(--bg-secondary)]/80 border-b border-[var(--border-primary)] text-[var(--text-secondary)] text-[9px] font-bold uppercase tracking-wider font-mono">
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Thesis Focus Area</th>
                          <th className="p-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-primary)]">
                        {users.map((member) => {
                          const badge = getRoleBadgeStyles(member.role);
                          return (
                            <tr key={member.id} className="hover:bg-[var(--bg-secondary)]/50 text-[11px] text-[var(--text-secondary)] transition-colors duration-150">
                              <td className="p-2.5 font-bold text-[var(--text-primary)]">{member.name}</td>
                              <td className="p-2.5">
                                <span className={`text-[8px] font-bold border px-1.5 py-0.2 rounded inline-block ${badge.bg}`}>
                                  {badge.label.split(' ')[0]}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono text-[10px] text-[var(--text-secondary)]">{member.email}</td>
                              <td className="p-2.5 max-w-[180px] truncate text-[var(--text-secondary)] italic">
                                {member.thesisTitle || 'N/A'}
                              </td>
                              <td className="p-2.5 text-right space-x-1 font-sans">
                                <button 
                                  onClick={() => handleOpenEditUser(member)}
                                  className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-block cursor-pointer"
                                  title="Edit Account"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                {member.id !== currentUser.id && (
                                  <button 
                                    onClick={() => deleteUser(member.id)}
                                    className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)] hover:text-red-500 transition-colors inline-block cursor-pointer"
                                    title="Delete Account"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: Lab Settings */}
              {activeAdminTab === 'SETTINGS' && isStaff && (
                <div className="space-y-4 max-w-lg">
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest font-mono">
                      Global Lab Configuration
                    </h3>
                    <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">
                      Configure dynamic grant references, lab-wide status flags, and current supervision semester timelines.
                    </p>
                  </div>

                  {settingsSaved && (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-xs font-semibold animate-fade-in">
                      Settings updated successfully.
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Active Grant Reference</label>
                      <input
                        type="text"
                        value={labGrant}
                        onChange={(e) => setLabGrant(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Operational Status</label>
                      <select
                        value={labStatus}
                        onChange={(e) => setLabStatus(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                      >
                        <option value="Nominal">Nominal Operations</option>
                        <option value="Auditing">Under Audit</option>
                        <option value="Maintenance">Equipment Maintenance</option>
                        <option value="Safety Review">Safety Compliance Review</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Supervision Semester Target</label>
                      <input
                        type="text"
                        value={semesterWindow}
                        onChange={(e) => setSemesterWindow(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setSettingsSaved(true);
                        setTimeout(() => setSettingsSaved(false), 2000);
                      }}
                      className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold px-3 py-1.5 rounded transition-all shadow-sm cursor-pointer block"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'KANBAN' && (
            <Board />
          )}

          {currentView === 'CALENDAR' && (
            <AcademicCalendar />
          )}

          {currentView === 'LOGISTICS' && (
            <div className="glass-panel rounded-lg p-8 text-center max-w-xl mx-auto mt-12 glow-accent text-container-max">
              <FlaskConical className="w-12 h-12 text-[var(--accent)] mx-auto mb-3" />
              <h2 className="text-md font-bold text-[var(--text-primary)]">Lab Assistant Operations Panel</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                Logistics panel for tracking ICP-MS spectroscopy calibrating schedules, waste disposal audits, chemical compliance safety parameters, and general asset registers.
              </p>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[var(--accent)] font-semibold hover:underline cursor-pointer">
                <span>Review compliance structures</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Invite Member Modal */}
      {addUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg max-w-sm w-full p-4 shadow-2xl relative glow-accent animate-in fade-in duration-200">
            <button 
              onClick={() => setAddUserModalOpen(false)}
              className="absolute right-3 top-3 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-4.5 h-4.5 text-[var(--accent)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Invite New Lab Member</h3>
            </div>
            
            <form onSubmit={handleAddUserSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  placeholder="e.g. Richard Feynman"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  placeholder="r.feynman@university.edu"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Role Type</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="BACHELOR_STUDENT">Bachelor Student (B.Sc.)</option>
                  <option value="MASTER_STUDENT">Master Student (M.Sc.)</option>
                  <option value="PHD_STUDENT">PhD Student (PhD)</option>
                  <option value="POSTDOC">Postdoc Researcher</option>
                  <option value="LAB_ASSISTANT">Lab Assistant</option>
                </select>
              </div>

              {newUserRole.includes('STUDENT') && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Thesis Title</label>
                    <textarea 
                      value={newUserThesis}
                      onChange={(e) => setNewUserThesis(e.target.value)}
                      required
                      placeholder="Enter research thesis title"
                      rows={2}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Advisor / Supervisor</label>
                    <select
                      value={newUserAdvisor}
                      onChange={(e) => setNewUserAdvisor(e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
                    >
                      <option value="u-pi">Prof. Arthur Pendelton</option>
                      <option value="u-postdoc">Dr. Beatrice Vance</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-2 justify-end pt-2 border-t border-[var(--border-primary)]">
                <button 
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  className="px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] rounded text-xs transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded text-xs font-semibold transition-all shadow-sm"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg max-w-sm w-full p-4 shadow-2xl relative glow-accent animate-in fade-in duration-200">
            <button 
              onClick={() => setEditUserModalOpen(false)}
              className="absolute right-3 top-3 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Edit2 className="w-4.5 h-4.5 text-[var(--accent)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Edit Lab Member</h3>
            </div>
            
            <form onSubmit={handleEditUserSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Role Type</label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="PI">Principal Investigator (PI)</option>
                  <option value="POSTDOC">Postdoc Researcher</option>
                  <option value="PHD_STUDENT">PhD Student (PhD)</option>
                  <option value="MASTER_STUDENT">Master Student (M.Sc.)</option>
                  <option value="BACHELOR_STUDENT">Bachelor Student (B.Sc.)</option>
                  <option value="LAB_ASSISTANT">Lab Assistant</option>
                </select>
              </div>

              {editUserRole.includes('STUDENT') && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Thesis Title</label>
                    <textarea 
                      value={editUserThesis}
                      onChange={(e) => setEditUserThesis(e.target.value)}
                      required
                      rows={2}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Advisor / Supervisor</label>
                    <select
                      value={editUserAdvisor}
                      onChange={(e) => setEditUserAdvisor(e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
                    >
                      <option value="u-pi">Prof. Arthur Pendelton</option>
                      <option value="u-postdoc">Dr. Beatrice Vance</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-2 justify-end pt-2 border-t border-[var(--border-primary)]">
                <button 
                  type="button"
                  onClick={() => setEditUserModalOpen(false)}
                  className="px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] rounded text-xs transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded text-xs font-semibold transition-all shadow-sm"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
