'use client';

import React, { useState } from 'react';
import { useAcademicStore } from '../../store/academicStore';
import { ResearchActivity, TeachingSchedule } from '../../types/academic';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  X, 
  Check, 
  BookOpen, 
  Move,
  MapPin,
  Edit2,
  Video,
  ExternalLink
} from 'lucide-react';

export default function AcademicCalendar() {
  const { 
    currentUser, 
    researchActivities, 
    teachingSchedules, 
    addResearchActivity, 
    updateResearchActivity, 
    deleteResearchActivity 
  } = useAcademicStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [calendarMode, setCalendarMode] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [monthOffset, setMonthOffset] = useState(0);

  const getLocalDateString = (offsetDays: number) => {
    const baseDate = new Date('2026-05-25T12:00:00'); // Use noon to avoid timezone shift
    baseDate.setDate(baseDate.getDate() + offsetDays);
    return baseDate.toISOString().split('T')[0];
  };

  const getDayNameAndFormat = (offsetDays: number) => {
    const baseDate = new Date('2026-05-25T12:00:00');
    baseDate.setDate(baseDate.getDate() + offsetDays);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    return baseDate.toLocaleDateString('en-US', options);
  };

  const getYearAndMonth = (offset: number) => {
    let year = 2026;
    let month = 4; // May (0-indexed)
    month += offset;
    
    const d = new Date(year, month, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  };

  const getMonthGridDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const dayOfWeek = firstDay.getDay(); // 0 is Sunday

    const startGridDate = new Date(firstDay);
    startGridDate.setDate(firstDay.getDate() - dayOfWeek);

    const cells: { dateStr: string; isCurrentMonth: boolean; dayNum: number }[] = [];
    
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startGridDate);
      cellDate.setDate(startGridDate.getDate() + i);
      
      cells.push({
        dateStr: cellDate.toISOString().split('T')[0],
        isCurrentMonth: cellDate.getMonth() === month,
        dayNum: cellDate.getDate()
      });
    }
    
    return cells;
  };
  
  // Add Form States
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-05-25'); // default Monday
  const [newStart, setNewStart] = useState('10:00');
  const [newEnd, setNewEnd] = useState('11:30');
  const [newType, setNewType] = useState<'MEETING' | 'DEFENSE' | 'SEMINAR' | 'LAB_WORK' | 'DEADLINE'>('MEETING');
  const [newDesc, setNewDesc] = useState('');
  const [generateZoom, setGenerateZoom] = useState(false);

  // Editing state
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  if (!currentUser) return null;

  // Retrieve teaching schedule for current user (PI/Postdoc)
  const currentTeaching = teachingSchedules[currentUser.id];

  // Helper to map date to day of week index (0 = Sunday, 1 = Monday, etc.)
  const getDayOfWeek = (dateStr: string) => {
    return new Date(dateStr).getDay();
  };

  // Helper to convert "HH:MM" to minutes from midnight
  const timeToMins = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Conflict Detection Engine
  // Checks if a research activity overlaps with any fixed teaching schedules
  const getConflictDetails = (activity: ResearchActivity): { hasConflict: boolean; courseName?: string } => {
    if (!currentTeaching) return { hasConflict: false };

    const actDay = getDayOfWeek(activity.date);
    
    // Check recurrence blocks
    for (const courseBlock of currentTeaching.recurrence) {
      if (courseBlock.dayOfWeek === actDay) {
        const actStart = timeToMins(activity.startTime);
        const actEnd = timeToMins(activity.endTime);
        const courseStart = timeToMins(courseBlock.startTime);
        const courseEnd = timeToMins(courseBlock.endTime);

        // Check time intersection
        if (actStart < courseEnd && actEnd > courseStart) {
          return { 
            hasConflict: true, 
            courseName: `${currentTeaching.courseId}: ${currentTeaching.courseName} (${courseBlock.startTime} - ${courseBlock.endTime})` 
          };
        }
      }
    }

    return { hasConflict: false };
  };

  // Days list mapping (dynamically calculated based on weekOffset)
  const days = [
    { label: getDayNameAndFormat(weekOffset * 7 + 0), dateStr: getLocalDateString(weekOffset * 7 + 0) },
    { label: getDayNameAndFormat(weekOffset * 7 + 1), dateStr: getLocalDateString(weekOffset * 7 + 1) },
    { label: getDayNameAndFormat(weekOffset * 7 + 2), dateStr: getLocalDateString(weekOffset * 7 + 2) },
    { label: getDayNameAndFormat(weekOffset * 7 + 3), dateStr: getLocalDateString(weekOffset * 7 + 3) },
    { label: getDayNameAndFormat(weekOffset * 7 + 4), dateStr: getLocalDateString(weekOffset * 7 + 4) },
    { label: getDayNameAndFormat(weekOffset * 7 + 5), dateStr: getLocalDateString(weekOffset * 7 + 5) },
    { label: getDayNameAndFormat(weekOffset * 7 + 6), dateStr: getLocalDateString(weekOffset * 7 + 6) }
  ];

  // Compile all events for a specific day
  const getDayEvents = (dateStr: string) => {
    const dayIndex = getDayOfWeek(dateStr);
    const dayEvents: any[] = [];

    // 1. Add Teaching Courses if active
    if (currentTeaching) {
      currentTeaching.recurrence.forEach(recur => {
        if (recur.dayOfWeek === dayIndex) {
          dayEvents.push({
            id: `course-${currentTeaching.courseId}-${recur.startTime}`,
            title: `${currentTeaching.courseId}: ${currentTeaching.courseName}`,
            description: `Fixed Course Lecture • Classroom: ${recur.classroom}`,
            startTime: recur.startTime,
            endTime: recur.endTime,
            type: 'TEACHING',
            isFixed: true
          });
        }
      });
    }

    // 2. Add Research Activities
    researchActivities.forEach(act => {
      if (act.date === dateStr) {
        const conflict = getConflictDetails(act);
        dayEvents.push({
          ...act,
          isFixed: false,
          conflict
        });
      }
    });

    // Sort chronologically
    return dayEvents.sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let zoomMeeting;
    if (generateZoom) {
      const rawId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const formattedId = `${rawId.substring(0, 3)} ${rawId.substring(3, 6)} ${rawId.substring(6)}`;
      const pass = Math.random().toString(36).substring(2, 8).toUpperCase();
      zoomMeeting = {
        joinUrl: `https://zoom.us/j/${rawId}?pwd=${pass}`,
        meetingId: formattedId,
        passcode: pass
      };
    }

    addResearchActivity({
      id: `a-${Date.now()}`,
      title: newTitle,
      description: newDesc || undefined,
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
      type: newType,
      zoomMeeting
    });

    setNewTitle('');
    setNewDesc('');
    setGenerateZoom(false);
    setIsAddModalOpen(false);
  };

  const handleEditClick = (act: ResearchActivity) => {
    setEditingActivityId(act.id);
    setEditDate(act.date);
    setEditStart(act.startTime);
    setEditEnd(act.endTime);
  };

  const handleSaveEdit = (actId: string) => {
    updateResearchActivity(actId, editDate, editStart, editEnd);
    setEditingActivityId(null)  };

  const { year: activeYear, month: activeMonth } = getYearAndMonth(monthOffset);
  const activeMonthName = new Date(activeYear, activeMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthDaysHeader = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getWeekRangeStr = () => {
    if (days.length === 0) return '';
    const startStr = days[0].dateStr;
    const endStr = days[6].dateStr;
    return `Week: ${startStr} to ${endStr}`;
  };

  return (
    <div className="space-y-4">
      {/* Banner / Warning Indicators */}
      {researchActivities.some(act => getConflictDetails(act).hasConflict) && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-2.5 rounded text-xs flex items-center gap-2 glow-rose animate-pulse">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Schedule Conflict Warning:</strong> Dynamic research meetings are currently overlapping with fixed lecture timetable blocks. Please adjust activity times.
          </span>
        </div>
      )}

      {/* Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-2.5 transition-all animate-in fade-in duration-150">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-[var(--accent)] font-bold block font-mono">
            {calendarMode === 'WEEK' ? getWeekRangeStr() : activeMonthName}
          </span>
          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 max-w-lg text-container-max leading-relaxed">
            Schedule research milestones and sync teaching obligations. Fixed courses are <strong className="text-[var(--text-primary)] font-bold">locked</strong>, while research activities can be updated to resolve clashes.
          </p>
        </div>

        {/* View switcher & Navigation Panel */}
        <div className="flex flex-wrap items-center gap-2.5 font-sans">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] p-0.5 rounded shadow-xs">
            <button
              type="button"
              onClick={() => setCalendarMode('WEEK')}
              className={`px-2.5 py-1 text-[9px] font-bold rounded cursor-pointer transition-all ${
                calendarMode === 'WEEK'
                  ? 'text-[var(--accent)] bg-[var(--accent-bg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              Week View
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode('MONTH')}
              className={`px-2.5 py-1 text-[9px] font-bold rounded cursor-pointer transition-all ${
                calendarMode === 'MONTH'
                  ? 'text-[var(--accent)] bg-[var(--accent-bg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              Month View
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] p-0.5 rounded shadow-xs">
            {calendarMode === 'WEEK' ? (
              <>
                <button
                  type="button"
                  onClick={() => setWeekOffset(w => w - 1)}
                  className="px-2.5 py-1 text-[9px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--bg-secondary)] cursor-pointer transition-all"
                >
                  &larr; Prev Week
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  className="px-2.5 py-1 text-[9px] font-bold text-[var(--accent)] bg-[var(--accent-bg)] rounded cursor-pointer transition-all"
                >
                  Current Week
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset(w => w + 1)}
                  className="px-2.5 py-1 text-[9px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--bg-secondary)] cursor-pointer transition-all"
                >
                  Next Week &rarr;
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setMonthOffset(m => m - 1)}
                  className="px-2.5 py-1 text-[9px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--bg-secondary)] cursor-pointer transition-all"
                >
                  &larr; Prev Month
                </button>
                <button
                  type="button"
                  onClick={() => setMonthOffset(0)}
                  className="px-2.5 py-1 text-[9px] font-bold text-[var(--accent)] bg-[var(--accent-bg)] rounded cursor-pointer transition-all"
                >
                  Current Month
                </button>
                <button
                  type="button"
                  onClick={() => setMonthOffset(m => m + 1)}
                  className="px-2.5 py-1 text-[9px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--bg-secondary)] cursor-pointer transition-all"
                >
                  Next Month &rarr;
                </button>
              </>
            )}
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => {
            setNewDate(calendarMode === 'WEEK' ? getLocalDateString(weekOffset * 7) : `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-01`);
            setIsAddModalOpen(true);
          }}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-2.5 py-1 text-[10px] font-bold text-white rounded flex items-center gap-1 shadow-sm cursor-pointer shrink-0 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Book Activity
        </button>
      </div>

      {/* Dynamic Grid: Week View or Month View */}
      {calendarMode === 'WEEK' ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5 items-start overflow-x-auto min-w-[950px] transition-all">
          {days.map((day) => {
            const events = getDayEvents(day.dateStr);
            return (
              <div 
                key={day.label}
                className="glass-panel p-2.5 rounded-lg flex flex-col min-h-[350px] bg-[var(--bg-secondary)]/50 shrink-0"
              >
                {/* Day Header */}
                <div className="pb-1.5 border-b border-[var(--border-primary)] mb-2 flex items-baseline justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)] font-sans">{day.label}</span>
                  <span className="text-[9px] font-mono text-[var(--text-tertiary)]">{day.dateStr}</span>
                </div>

                {/* Event Stack */}
                <div className="space-y-2 flex-1">
                  {events.length === 0 ? (
                    <div className="text-center py-8 text-[var(--text-tertiary)] text-[9px] italic">
                      Free / No activities
                    </div>
                  ) : (
                    events.map((act) => {
                      const isCourse = act.type === 'TEACHING';
                      const hasConflict = act.conflict?.hasConflict;
                      
                      return (
                        <div 
                          key={act.id} 
                          className={`p-2 rounded border text-xs relative transition-all ${
                            isCourse 
                              ? 'bg-neutral-800/10 border-neutral-400/25 dark:bg-neutral-200/5 dark:border-neutral-700 text-[var(--text-secondary)] border-dashed'
                              : hasConflict
                              ? 'bg-red-500/10 border-red-500/40 glow-rose text-[var(--text-primary)]'
                              : 'bg-[var(--bg-primary)] border-[var(--border-primary)] hover:border-[var(--border-secondary)] text-[var(--text-primary)] shadow-sm'
                          }`}
                        >
                          {/* Time details */}
                          <div className="flex items-center justify-between text-[9px] text-[var(--text-tertiary)] font-mono mb-1">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> {act.startTime} - {act.endTime}
                            </span>
                            {isCourse ? (
                              <span className="font-semibold text-neutral-500">Locked Class</span>
                            ) : (
                              <span className="bg-[var(--accent-bg)] text-[var(--accent)] font-bold px-1 rounded uppercase scale-90">
                                {act.type}
                              </span>
                            )}
                          </div>

                          {/* Event Title */}
                          <h4 className="font-bold text-[var(--text-primary)] leading-tight">
                            {act.title}
                          </h4>
                          
                          {/* Description */}
                          {act.description && (
                            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 line-clamp-2 leading-snug">
                              {act.description}
                            </p>
                          )}

                          {/* Zoom Details */}
                          {act.zoomMeeting && (
                            <div className="mt-1.5 p-1.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded text-[9px] font-sans space-y-1">
                              <div className="flex items-center gap-1 text-[var(--accent)] font-semibold">
                                <Video className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                                <a 
                                  href={act.zoomMeeting.joinUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:underline flex items-center gap-0.5"
                                >
                                  Join Zoom Meeting <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                              <div className="text-[8px] text-[var(--text-tertiary)] font-mono flex flex-wrap gap-x-2 gap-y-0.5">
                                <span>ID: {act.zoomMeeting.meetingId}</span>
                                <span>Pass: {act.zoomMeeting.passcode}</span>
                              </div>
                            </div>
                          )}

                          {/* Conflict Warning Block */}
                          {hasConflict && (
                            <div className="mt-1.5 bg-red-555/10 border border-red-500/20 rounded p-1 text-[9px] text-red-555 flex items-start gap-1 leading-normal font-sans">
                              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                              <span>
                                <strong>Schedule Clash:</strong> Overlaps teaching slot: <i>{act.conflict.courseName}</i>
                              </span>
                            </div>
                          )}

                          {/* Interactive Edit / Delete actions for Research activities */}
                          {!isCourse && (
                            <div className="mt-2 pt-1 border-t border-[var(--border-primary)]/40 flex justify-between items-center gap-2">
                              {editingActivityId === act.id ? (
                                <div className="flex items-center gap-1 w-full">
                                  <input 
                                    type="time" 
                                    value={editStart}
                                    onChange={(e) => setEditStart(e.target.value)}
                                    className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded text-[8px] p-0.5 focus:outline-none"
                                  />
                                  <span className="text-[8px] text-[var(--text-tertiary)]">-</span>
                                  <input 
                                    type="time" 
                                    value={editEnd}
                                    onChange={(e) => setEditEnd(e.target.value)}
                                    className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded text-[8px] p-0.5 focus:outline-none"
                                  />
                                  <button
                                    onClick={() => handleSaveEdit(act.id)}
                                    className="bg-emerald-600 text-white rounded p-0.5 hover:bg-emerald-500 cursor-pointer ml-auto"
                                    title="Save Time"
                                  >
                                    <Check className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingActivityId(null)}
                                    className="bg-[var(--bg-tertiary)] border rounded p-0.5 hover:bg-[var(--border-secondary)] cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditClick(act)}
                                    className="text-[9px] text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer font-semibold font-sans"
                                  >
                                    <Edit2 className="w-2.5 h-2.5" /> Reschedule
                                  </button>
                                  <button
                                    onClick={() => deleteResearchActivity(act.id)}
                                    className="text-[9px] text-[var(--text-tertiary)] hover:text-red-500 transition-colors cursor-pointer"
                                    title="Delete Event"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2 overflow-x-auto min-w-[950px] transition-all">
          {/* Month headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">
            {monthDaysHeader.map(d => (
              <div key={d} className="py-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded">
                {d}
              </div>
            ))}
          </div>
          
          {/* Month cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {getMonthGridDays(activeYear, activeMonth).map((cell, idx) => {
              const events = getDayEvents(cell.dateStr);
              const isToday = cell.dateStr === '2026-05-25'; // Simulated "current date" matching the dashboard context
              
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setNewDate(cell.dateStr);
                    setIsAddModalOpen(true);
                  }}
                  className={`min-h-[90px] p-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-left hover:bg-[var(--bg-secondary)]/40 hover:border-[var(--border-secondary)] transition-all cursor-pointer select-none flex flex-col justify-between group relative ${
                    !cell.isCurrentMonth ? 'opacity-40 bg-[var(--bg-secondary)]/10' : ''
                  }`}
                >
                  {/* Day Number Row */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold font-mono ${
                      isToday 
                        ? 'bg-[var(--accent)] text-white w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[9px]' 
                        : 'text-[var(--text-primary)]'
                    }`}>
                      {cell.dayNum}
                    </span>
                    {events.length > 0 && (
                      <span className="text-[8px] text-[var(--text-tertiary)] font-mono font-semibold">
                        {events.length} {events.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </div>

                  {/* Event summaries inside the cell */}
                  <div className="mt-1 flex-1 overflow-y-auto space-y-1 max-h-[60px] scrollbar-thin">
                    {events.slice(0, 3).map((act) => {
                      const isCourse = act.type === 'TEACHING';
                      const hasConflict = act.conflict?.hasConflict;
                      
                      return (
                        <div
                          key={act.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isCourse) {
                              handleEditClick(act);
                            }
                          }}
                          className={`text-[8px] font-semibold truncate px-1 py-0.5 rounded leading-tight block w-full select-none flex items-center gap-0.5 ${
                            isCourse 
                              ? 'bg-neutral-800/10 border border-neutral-400/25 dark:bg-neutral-200/5 dark:border-neutral-700 text-[var(--text-secondary)] border-dashed'
                              : hasConflict
                              ? 'bg-red-500/10 border border-red-500/40 text-red-500 glow-rose font-bold'
                              : 'bg-[var(--accent-bg)] border border-[var(--accent)]/20 text-[var(--accent)] font-bold'
                          }`}
                          title={`${act.startTime}-${act.endTime}: ${act.title}${act.zoomMeeting ? ' [Zoom Meeting]' : ''}`}
                        >
                          {act.zoomMeeting && <Video className="w-2.5 h-2.5 text-[var(--accent)] shrink-0" />}
                          <span className="truncate">{act.startTime} {act.title}</span>
                        </div>
                      );
                    })}
                    {events.length > 3 && (
                      <div className="text-[8px] font-mono text-[var(--text-tertiary)] italic pl-1">
                        + {events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg max-w-md w-full p-4 space-y-3.5 shadow-2xl glow-accent animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-primary)]">
              <h3 className="text-xs font-bold text-[var(--text-primary)] font-mono uppercase tracking-wide">
                Book Research Activity
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Activity Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Isotherm Calibration Labwork"
                  required
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="MEETING">Meeting</option>
                    <option value="LAB_WORK">Lab Work</option>
                    <option value="SEMINAR">Seminar / Seminar dry run</option>
                    <option value="DEFENSE">Thesis Defense</option>
                    <option value="DEADLINE">Deadline Block</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Start Time</label>
                  <input 
                    type="time" 
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    required
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">End Time</label>
                  <input 
                    type="time" 
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    required
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Brief Description (Optional)</label>
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Generate Zoom Meeting */}
              <div className="flex items-center gap-2.5 py-1.5 select-none">
                <input
                  type="checkbox"
                  id="generateZoom"
                  checked={generateZoom}
                  onChange={(e) => setGenerateZoom(e.target.checked)}
                  className="cursor-pointer accent-[var(--accent)] w-3.5 h-3.5"
                />
                <label htmlFor="generateZoom" className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer flex items-center gap-1.5 font-mono">
                  <Video className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" /> Auto-Generate Zoom Meeting
                </label>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold py-2 rounded transition-all shadow-md cursor-pointer"
            >
              Confirm Booking
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
