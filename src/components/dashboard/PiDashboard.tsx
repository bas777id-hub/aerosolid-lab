'use client';

import React, { useState } from 'react';
import { useAcademicStore } from '../../store/academicStore';
import { User, AcademicMilestoneTrack, KanbanCard } from '../../types/academic';
import { 
  ClipboardList, 
  BookOpen, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Award,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import EmailDigestModal from './EmailDigestModal';

export default function PiDashboard() {
  const { 
    currentUser, 
    users, 
    cards, 
    studentTracks, 
    setCurrentView,
    setCurrentUser
  } = useAcademicStore();

  const isStaff = currentUser?.role === 'PI' || currentUser?.role === 'POSTDOC';
  const [activeDigestStudentId, setActiveDigestStudentId] = useState<string | null>(null);

  if (!isStaff) return null;

  // 1. Calculate Aggregate Lab Stats
  const studentUsers = users.filter(u => u.role.includes('STUDENT'));
  const totalStudents = studentUsers.length;
  
  // Pending approvals (cards in 'review' column)
  const pendingApprovals = Object.values(cards).filter(c => c.columnId === 'review');
  
  // Active experiments (cards in 'in_progress' and categorized as EXPERIMENTATION)
  const activeExperiments = Object.values(cards).filter(c => 
    c.columnId === 'in_progress' && c.category === 'EXPERIMENTATION'
  );
  
  // Total publications/papers (cards in 'approved' column and category WRITING)
  const publications = Object.values(cards).filter(c => 
    c.columnId === 'approved' && (c.category === 'WRITING' || c.academicMetadata.doi)
  );

  // Overall Lab Health Index (% of students ON_TRACK)
  const tracksList = Object.values(studentTracks);
  const onTrackCount = tracksList.filter(t => t.overallStatus === 'ON_TRACK').length;
  const labHealthPercent = totalStudents > 0 
    ? Math.round((onTrackCount / totalStudents) * 100) 
    : 100;

  const inspectStudentBoard = (studentId: string) => {
    setCurrentView('KANBAN');
  };

  return (
    <div className="space-y-4">
      {/* SECTION 1: Aggregate Lab Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-panel p-3 rounded-lg flex items-center justify-between transition-all hover:scale-[1.01] hover:border-[var(--accent)]/40 relative overflow-hidden group">
          <div className="space-y-1 min-w-0">
            <span className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold block font-mono">
              Pending Approvals
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {pendingApprovals.length}
              </span>
              <span className="text-[9px] text-[var(--text-secondary)]">manuscripts/tasks</span>
            </div>
          </div>
          <div className={`p-2 rounded bg-amber-500/10 text-amber-500 transition-all ${pendingApprovals.length > 0 ? 'animate-pulse' : ''}`}>
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-3 rounded-lg flex items-center justify-between transition-all hover:scale-[1.01] hover:border-[var(--accent)]/40 relative overflow-hidden group">
          <div className="space-y-1 min-w-0">
            <span className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold block font-mono">
              Active Experiments
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {activeExperiments.length}
              </span>
              <span className="text-[9px] text-[var(--text-secondary)]">in-lab runs</span>
            </div>
          </div>
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-500">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-3 rounded-lg flex items-center justify-between transition-all hover:scale-[1.01] hover:border-[var(--accent)]/40 relative overflow-hidden group">
          <div className="space-y-1 min-w-0">
            <span className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold block font-mono">
              Lab Publications
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {publications.length}
              </span>
              <span className="text-[9px] text-[var(--text-secondary)]">with DOIs</span>
            </div>
          </div>
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-500">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-3 rounded-lg flex items-center justify-between transition-all hover:scale-[1.01] hover:border-[var(--accent)]/40 relative overflow-hidden group">
          <div className="space-y-1 min-w-0">
            <span className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold block font-mono">
              Lab Health Index
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {labHealthPercent}%
              </span>
              <span className="text-[9px] text-[var(--text-secondary)]">on track</span>
            </div>
          </div>
          <div className={`p-2 rounded ${labHealthPercent > 70 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SECTION 2: Supervision & Progress Matrix */}
      <div className="glass-panel p-4 rounded-lg space-y-3">
        <div>
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest font-mono">
            Lab Student Supervision Matrix
          </h3>
          <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">
            Bird's-eye monitoring of all student graduation windows, defense tracks, paper completion velocities, and active status checks.
          </p>
        </div>

        <div className="overflow-x-auto border border-[var(--border-primary)] rounded bg-[var(--bg-primary)]/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/80 border-b border-[var(--border-primary)] text-[var(--text-secondary)] text-[9px] font-bold uppercase tracking-wider font-mono">
                <th className="p-2.5">Candidate / Thesis Title</th>
                <th className="p-2.5">Grad Window</th>
                <th className="p-2.5">Milestones Progress</th>
                <th className="p-2.5">Velocity (Actual vs Req)</th>
                <th className="p-2.5">Status Check</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {studentUsers.map((student) => {
                const track = studentTracks[student.id];
                if (!track) return null;

                const completedMilestones = track.milestones.filter(m => m.status === 'APPROVED').length;
                const totalMilestones = track.milestones.length;
                const progressPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
                
                const statusStyles = 
                  track.overallStatus === 'CRITICAL_STAGNATION' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 glow-rose animate-pulse' :
                  track.overallStatus === 'AT_RISK' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25' :
                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25';

                return (
                  <tr key={student.id} className="hover:bg-[var(--bg-secondary)]/50 text-[11px] text-[var(--text-secondary)] transition-colors duration-150">
                    <td className="p-2.5 max-w-[280px]">
                      <div className="font-bold text-[var(--text-primary)] leading-snug">{student.name}</div>
                      <div className="text-[8px] uppercase tracking-wider text-[var(--text-tertiary)] font-mono font-semibold">
                        {student.role === 'PHD_STUDENT' ? 'PhD Dissertation' : student.role === 'MASTER_STUDENT' ? 'Master Thesis' : 'Bachelor Thesis'}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] italic mt-1 font-sans line-clamp-2 text-container-max">
                        "{student.thesisTitle || 'No Thesis Allocated Yet'}"
                      </div>
                    </td>

                    <td className="p-2.5 font-mono text-[10px] text-[var(--text-primary)]">{track.targetGraduationWindow}</td>

                    <td className="p-2.5 w-[160px]">
                      <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                        <span className="font-bold text-[var(--text-primary)]">{completedMilestones}/{totalMilestones} Passed</span>
                        <span className="text-[var(--text-tertiary)]">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden w-full border border-[var(--border-primary)]/40">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            track.overallStatus === 'CRITICAL_STAGNATION' ? 'bg-red-500' :
                            track.overallStatus === 'AT_RISK' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {track.milestones.map((m) => (
                          <div 
                            key={m.id}
                            title={`${m.title}: ${m.status}`}
                            className={`w-2 h-2 rounded-full border border-[var(--bg-primary)] ${
                              m.status === 'APPROVED' ? 'bg-emerald-500' :
                              m.status === 'SUBMITTED_TO_PI' ? 'bg-blue-500 animate-pulse' :
                              m.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                              m.status === 'OVERDUE' ? 'bg-red-500' :
                              'bg-[var(--border-primary)]'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    <td className="p-2.5 font-mono text-[10px] w-[140px]">
                      <div className="flex items-center justify-between mb-0.5">
                        <span>Actual:</span>
                        <strong className={`font-bold ${track.actualVelocity >= track.requiredVelocity ? 'text-emerald-500' : 'text-red-500'}`}>
                          {track.actualVelocity}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-[var(--text-tertiary)]">
                        <span>Required:</span>
                        <span>{track.requiredVelocity} cards/wk</span>
                      </div>
                      <div className="h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden w-full mt-1.5">
                        <div 
                          className={`h-full ${track.actualVelocity >= track.requiredVelocity ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, (track.actualVelocity / Math.max(0.1, track.requiredVelocity)) * 100)}%` }}
                        />
                      </div>
                    </td>

                    <td className="p-2.5">
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase inline-flex items-center gap-1 ${statusStyles}`}>
                        {track.overallStatus === 'CRITICAL_STAGNATION' && <AlertTriangle className="w-2.5 h-2.5 shrink-0" />}
                        {track.overallStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-2.5 text-right space-x-1.5 font-sans">
                      <button
                        onClick={() => inspectStudentBoard(student.id)}
                        className="bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)] hover:text-white px-2 py-1 rounded text-[10px] font-bold transition-all inline-flex items-center gap-0.5 cursor-pointer shadow-xs"
                      >
                        Inspect Board <ArrowUpRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setActiveDigestStudentId(student.id)}
                        className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)] px-2 py-1 rounded text-[10px] font-bold transition-all inline-flex items-center gap-0.5 cursor-pointer shadow-xs"
                        title="Preview Risk Email Alert Digest"
                      >
                        Alert Digest
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {activeDigestStudentId && (
        <EmailDigestModal 
          studentId={activeDigestStudentId} 
          onClose={() => setActiveDigestStudentId(null)} 
        />
      )}
    </div>
  );
}
