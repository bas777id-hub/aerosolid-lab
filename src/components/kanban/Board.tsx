'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useAcademicStore } from '../../store/academicStore';
import { getRoleBadgeStyles } from '../layout/Header';
import { KanbanCard, User, UserRole, Milestone } from '../../types/academic';
import { 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  X, 
  ChevronRight, 
  ExternalLink,
  Filter,
  CheckCircle,
  Play,
  RotateCcw,
  Edit2,
  Trash2
} from 'lucide-react';
import CardModal from './CardModal';

export default function Board() {
  const { 
    currentUser, 
    columns, 
    cards, 
    users, 
    studentTracks, 
    moveCard, 
    approveCard,
    updateMilestoneStatus,
    addCard,
    addMilestone,
    deleteMilestone,
    updateMilestone
  } = useAcademicStore();

  const [mounted, setMounted] = useState(false);
  
  // Roster Filters & Active Views
  const isStaff = currentUser?.role === 'PI' || currentUser?.role === 'POSTDOC';
  const defaultSelectedStudent = isStaff ? 'u-bachelor-ethan' : currentUser?.id || '';
  const [selectedStudentId, setSelectedStudentId] = useState(defaultSelectedStudent);
  const [activeMilestoneFilter, setActiveMilestoneFilter] = useState<string | null>(null);
  
  // Warning Alert Banner State
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Card Modal State
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Add Card Modal Form States
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardSummary, setNewCardSummary] = useState('');
  const [newCardPriority, setNewCardPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [newCardCategory, setNewCardCategory] = useState<any>('LITERATURE_REVIEW');
  const [addCardTargetColumnId, setAddCardTargetColumnId] = useState('inbox');
  const [newCardAssigneeId, setNewCardAssigneeId] = useState('');

  // Milestone Track Manager States
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editMilestoneTitle, setEditMilestoneTitle] = useState('');
  const [editMilestoneDate, setEditMilestoneDate] = useState('');

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim() || !currentUser) return;

    const activeAssigneeId = newCardAssigneeId || (isStaff ? selectedStudentId : currentUser.id);
    addCard(newCardTitle, newCardSummary, newCardPriority, newCardCategory, activeAssigneeId, addCardTargetColumnId);

    setNewCardTitle('');
    setNewCardSummary('');
    setNewCardPriority('MEDIUM');
    setNewCardCategory('LITERATURE_REVIEW');
    setNewCardAssigneeId('');
    setIsAddCardModalOpen(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !currentUser) return null;

  const currentStudent = users.find(u => u.id === selectedStudentId);
  const currentTrack = studentTracks[selectedStudentId];

  // Drag and Drop handler
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Call store moveCard action
    const response = moveCard(
      draggableId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );

    if (!response.success) {
      setAuthError(response.error || 'Permission Denied');
      // Hide error after 4 seconds
      setTimeout(() => {
        setAuthError(null);
      }, 4000);
    }
  };

  // Helper for milestone status styles
  const getMilestoneStatusStyles = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500',
          label: 'Approved'
        };
      case 'SUBMITTED_TO_PI':
        return {
          bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
          dot: 'bg-blue-500',
          label: 'PI Review'
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500 animate-pulse',
          label: 'Active'
        };
      case 'OVERDUE':
        return {
          bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
          dot: 'bg-red-500',
          label: 'Overdue'
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/30',
          dot: 'bg-slate-400',
          label: 'Not Started'
        };
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Banner Warns */}
      {authError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-3.5 py-2.5 rounded text-xs flex items-center justify-between glow-rose animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{authError}</span>
          </div>
          <button onClick={() => setAuthError(null)} className="text-red-500 hover:text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Board Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-2.5 transition-all">
        <div className="flex items-center gap-3">
          {/* Supervisor board selector */}
          {isStaff ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)] font-semibold">Active Board:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setActiveMilestoneFilter(null);
                }}
                className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-semibold"
              >
                {users.filter(u => u.role.includes('STUDENT')).map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.role === 'PHD_STUDENT' ? 'PhD' : student.role === 'MASTER_STUDENT' ? 'Master' : 'Bachelor'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-xs text-[var(--text-secondary)]">
              Thesis Board:{' '}
              <strong className="text-[var(--text-primary)] font-bold">
                {currentUser.name}
              </strong>
            </div>
          )}

          {activeMilestoneFilter && (
            <div className="flex items-center gap-1.5 bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]/30 px-2 py-0.5 rounded text-[10px] font-semibold font-mono">
              <Filter className="w-3 h-3" />
              <span>Milestone Filter Active</span>
              <button 
                onClick={() => setActiveMilestoneFilter(null)}
                className="hover:text-[var(--text-primary)] ml-1"
                title="Clear Filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Board Overview Metadata */}
        {currentStudent && (
          <div className="hidden sm:flex items-center gap-4 text-[10px] text-[var(--text-secondary)] font-mono">
            <div>
              Advisor:{' '}
              <span className="text-[var(--text-primary)] font-semibold">
                {currentStudent.advisorId === 'u-pi' ? 'Prof. Pendelton' : 'Dr. Beatrice'}
              </span>
            </div>
            {currentTrack && (
              <div>
                Risk Status:{' '}
                <span className={`font-bold ${
                  currentTrack.overallStatus === 'CRITICAL_STAGNATION' ? 'text-red-500' :
                  currentTrack.overallStatus === 'AT_RISK' ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {currentTrack.overallStatus.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start flex-1 min-h-0">
        
        {/* LEFT COLUMN: Academic Milestone Timeline Split Panel Widget */}
        <div className="glass-panel p-3.5 rounded-lg flex flex-col max-h-[calc(100vh-180px)] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-primary)] mb-3 flex-wrap gap-1">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] font-mono">
                Milestone Track
              </h3>
              <span className="text-[8px] font-mono text-[var(--text-tertiary)] uppercase block">
                {currentTrack?.defenseType.replace('_', ' ') || 'Academic timeline'}
              </span>
            </div>
            {currentTrack && (
              <button
                type="button"
                onClick={() => {
                  setNewMilestoneTitle('');
                  setNewMilestoneDate('');
                  setIsMilestoneModalOpen(true);
                }}
                className="text-[9px] bg-[var(--bg-tertiary)] hover:bg-[var(--border-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] px-2 py-0.5 rounded font-bold cursor-pointer transition-all shadow-xs"
              >
                Manage Track
              </button>
            )}
          </div>

          {!currentTrack ? (
            <div className="text-center py-8 text-[var(--text-tertiary)] text-xs">
              Milestone tracks are active for Bachelor, Master, or PhD student roles.
            </div>
          ) : (
            <div className="space-y-4 relative pl-3.5 before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[var(--border-primary)] transition-all">
              {currentTrack.milestones.map((milestone, idx) => {
                const isSelected = activeMilestoneFilter === milestone.id;
                const statusInfo = getMilestoneStatusStyles(milestone.status);
                
                // Count cards linked to this milestone
                const linkedCards = Object.values(cards).filter(c => 
                  c.assigneeId === selectedStudentId && 
                  milestone.linkedCardIds.includes(c.id)
                );
                
                return (
                  <div 
                    key={milestone.id}
                    className={`relative space-y-1.5 transition-all p-2 rounded border group ${
                      isSelected 
                        ? 'bg-[var(--accent-bg)] border-[var(--accent)]/45 glow-accent' 
                        : 'border-transparent hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    {/* Circle Node */}
                    <div 
                      className={`absolute -left-[18.5px] top-[7px] w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-primary)] ${statusInfo.dot} z-10`}
                    />
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <button 
                        onClick={() => setActiveMilestoneFilter(isSelected ? null : milestone.id)}
                        className="text-xs font-bold text-left hover:text-[var(--accent)] text-[var(--text-primary)] leading-tight flex-1 font-sans cursor-pointer"
                      >
                        {milestone.title}
                      </button>
                      
                      {/* Status Toggle / Approve Gate triggers for PI */}
                      {isStaff ? (
                        <select
                          value={milestone.status}
                          onChange={(e) => updateMilestoneStatus(selectedStudentId, milestone.id, e.target.value as any)}
                          className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded text-[8px] font-bold px-1 py-0.2 text-[var(--text-secondary)] focus:outline-none"
                        >
                          <option value="NOT_STARTED">Not Started</option>
                          <option value="IN_PROGRESS">Active</option>
                          <option value="SUBMITTED_TO_PI">Review</option>
                          <option value="APPROVED">Approved</option>
                          <option value="OVERDUE">Overdue</option>
                        </select>
                      ) : (
                        <span className={`text-[8px] font-bold border px-1 rounded ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-[9px] text-[var(--text-tertiary)] font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {milestone.targetDate}
                      </span>
                      <span>
                        {linkedCards.length} tasks linked
                      </span>
                    </div>

                    {/* Linked Cards mini list */}
                    {linkedCards.length > 0 && (
                      <div className="pt-1.5 space-y-1 border-t border-[var(--border-primary)]/40">
                        {linkedCards.map(c => (
                          <div 
                            key={c.id} 
                            className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          >
                            <span className="truncate max-w-[120px]">{c.title}</span>
                            <span className="text-[8px] text-[var(--text-tertiary)] font-mono">
                              {c.columnId === 'approved' ? 'Approved' : 'Active'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMNS: Core Kanban Board Layout */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-full items-start overflow-x-auto min-w-[700px] pb-2">
              {columns.map((column) => {
                // Filter card items mapped to this column
                const columnCards = column.cardIds
                  .map((id) => cards[id])
                  .filter((c): c is KanbanCard => !!c)
                  // Filter by selected student
                  .filter(c => isStaff ? c.assigneeId === selectedStudentId : c.assigneeId === currentUser.id)
                  // Filter by milestone if active
                  .filter(c => !activeMilestoneFilter || (currentTrack?.milestones.find(m => m.id === activeMilestoneFilter)?.linkedCardIds.includes(c.id)));

                return (
                  <div 
                    key={column.id}
                    className="flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg max-h-[calc(100vh-180px)] overflow-hidden shrink-0"
                  >
                    {/* Column Header */}
                    <div className="p-2 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/60 flex items-center justify-between z-10">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {column.isApprovalGate && <Lock className="w-3 h-3 text-[var(--accent)] shrink-0" />}
                        <h4 className="text-xs font-bold truncate text-[var(--text-primary)] font-sans">
                          {column.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          type="button"
                          onClick={() => {
                            setAddCardTargetColumnId(column.id);
                            setNewCardAssigneeId(isStaff ? selectedStudentId : currentUser.id);
                            setIsAddCardModalOpen(true);
                          }}
                          className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--accent)] cursor-pointer flex items-center justify-center border border-[var(--border-primary)] bg-[var(--bg-primary)] shadow-xs"
                          title={`Add Task to ${column.title}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[9px] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-mono font-bold px-1.5 py-0.2 rounded">
                          {columnCards.length}
                        </span>
                      </div>
                    </div>

                    {/* Droppable cards zone */}
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-2 space-y-2 overflow-y-auto min-h-[150px] flex-1 transition-colors duration-150 ${
                            snapshot.isDraggingOver ? 'bg-[var(--bg-tertiary)]/50' : ''
                          }`}
                        >
                          {columnCards.map((card, index) => {
                            const assignee = users.find(u => u.id === card.assigneeId);
                            return (
                              <Draggable key={card.id} draggableId={card.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.dragHandleProps}
                                    {...provided.draggableProps}
                                    onClick={() => setActiveCardId(card.id)}
                                    className={`bg-[var(--bg-primary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] p-2.5 rounded shadow-sm text-xs space-y-1.5 transition-all select-none draggable-card cursor-grab active:cursor-grabbing ${
                                      snapshot.isDragging ? 'bg-[var(--bg-tertiary)] border-[var(--accent)] scale-102 shadow-lg glow-accent' : ''
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2.5">
                                      <span className={`text-[8px] font-bold px-1 py-0.2 rounded border ${
                                        card.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/25 glow-rose' :
                                        card.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border-amber-500/25' :
                                        'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-primary)]'
                                      }`}>
                                        {card.priority}
                                      </span>
                                      
                                      <span className="text-[8px] text-[var(--text-tertiary)] font-mono truncate max-w-[80px]">
                                        {card.category.replace('_', ' ')}
                                      </span>
                                    </div>

                                    <h5 className="font-bold text-[var(--text-primary)] leading-tight leading-snug line-clamp-2">
                                      {card.title}
                                    </h5>
                                    
                                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                                      {card.summary}
                                    </p>

                                    {/* Task Assignee and Due Date */}
                                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border-primary)]/40 text-[9px] text-[var(--text-tertiary)] font-mono">
                                      <span>{assignee?.name.split(' ').pop()}</span>
                                      {card.dueDate && <span>{card.dueDate}</span>}
                                    </div>

                                    {/* Approval States Footer inside Card */}
                                    <div className="flex items-center justify-between pt-1 text-[9px]">
                                      <div className="flex items-center gap-1.5 font-semibold text-[var(--accent)]">
                                        {card.artifactLinks.overleaf && <span className="hover:underline">Overleaf</span>}
                                        {card.artifactLinks.gitHub && <span className="hover:underline">GitHub</span>}
                                      </div>
                                      
                                      <div>
                                        {card.isApproved ? (
                                          <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 border border-emerald-500/20 rounded flex items-center gap-0.5">
                                            <CheckCircle className="w-2.5 h-2.5" /> Approved
                                          </span>
                                        ) : card.approvalRequested ? (
                                          <span className="text-[8px] bg-amber-500/10 text-amber-500 font-bold px-1.5 py-0.2 border border-amber-500/25 rounded flex items-center gap-0.5 animate-pulse">
                                            PI Review
                                          </span>
                                        ) : (
                                          <span className="text-[8px] text-[var(--text-tertiary)]">Draft</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      </div>

      {activeCardId && (
        <CardModal cardId={activeCardId} onClose={() => setActiveCardId(null)} />
      )}

      {/* Add Task Modal */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddCardSubmit} className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg max-w-md w-full p-4 space-y-3.5 shadow-2xl glow-accent animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-primary)]">
              <h3 className="text-xs font-bold text-[var(--text-primary)] font-mono uppercase tracking-wide">
                Create Academic Task
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddCardModalOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Task Title</label>
                <input 
                  type="text" 
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="e.g. Conduct SEM microscopy analysis"
                  required
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Summary / Abstract</label>
                <textarea 
                  value={newCardSummary}
                  onChange={(e) => setNewCardSummary(e.target.value)}
                  placeholder="Provide a brief summary of the task work..."
                  required
                  rows={3}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-container-max leading-normal"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Assignee</label>
                  <select
                    value={newCardAssigneeId || (isStaff ? selectedStudentId : currentUser.id)}
                    onChange={(e) => setNewCardAssigneeId(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-semibold"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role.split('_')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Priority</label>
                  <select
                    value={newCardPriority}
                    onChange={(e) => setNewCardPriority(e.target.value as any)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Category</label>
                  <select
                    value={newCardCategory}
                    onChange={(e) => setNewCardCategory(e.target.value as any)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="LITERATURE_REVIEW">Literature Review</option>
                    <option value="PROPOSAL">Proposal Phase</option>
                    <option value="METHODOLOGY">Methodology Validation</option>
                    <option value="EXPERIMENTATION">Active Experimentation</option>
                    <option value="WRITING">Writing & Manuscript</option>
                    <option value="DEFENSE_PREP">Defense Preparation</option>
                    <option value="LOGISTICS">Lab Logistics</option>
                    <option value="COMPLIANCE">Compliance / Auditing</option>
                    <option value="OTHER">Other Tasks</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold py-2 rounded transition-all shadow-md cursor-pointer"
            >
              Add Task to Board
            </button>
          </form>
        </div>
      )}

      {/* Milestone Track Manager Modal */}
      {isMilestoneModalOpen && currentTrack && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg max-w-md w-full p-4 space-y-4 shadow-2xl glow-accent animate-in fade-in duration-200 text-xs text-[var(--text-primary)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-primary)]">
              <div>
                <h3 className="text-xs font-bold text-[var(--text-primary)] font-mono uppercase tracking-wide">
                  Manage Academic Milestones
                </h3>
                <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">
                  Student: {currentStudent?.name} • Track: {currentTrack.defenseType.replace('_', ' ')}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsMilestoneModalOpen(false);
                  setEditingMilestoneId(null);
                }}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Part 1: Add Milestone Form */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-3 rounded space-y-2">
              <h4 className="font-bold text-[10px] text-[var(--text-primary)] uppercase tracking-wider font-mono">
                Add New Milestone
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-[var(--text-tertiary)] uppercase block mb-0.5">Milestone Title</label>
                  <input
                    type="text"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="e.g. Thesis Draft Submission"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded p-1 text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-tertiary)] uppercase block mb-0.5">Target Date</label>
                  <input
                    type="date"
                    value={newMilestoneDate}
                    onChange={(e) => setNewMilestoneDate(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded p-1 text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newMilestoneTitle.trim() || !newMilestoneDate) return;
                  addMilestone(selectedStudentId, newMilestoneTitle, newMilestoneDate);
                  setNewMilestoneTitle('');
                  setNewMilestoneDate('');
                }}
                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[10px] font-bold px-3 py-1 rounded transition-all cursor-pointer shadow-xs"
              >
                Add Milestone
              </button>
            </div>

            {/* Part 2: Milestones List with Edits & Deletes */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <h4 className="font-bold text-[10px] text-[var(--text-primary)] uppercase tracking-wider font-mono">
                Current Milestones ({currentTrack.milestones.length})
              </h4>
              {currentTrack.milestones.length === 0 ? (
                <p className="text-[11px] text-[var(--text-tertiary)] italic">No milestones defined for this track.</p>
              ) : (
                currentTrack.milestones.map((m) => {
                  const isEditing = editingMilestoneId === m.id;
                  return (
                    <div key={m.id} className="border border-[var(--border-primary)] rounded p-2.5 space-y-2 bg-[var(--bg-primary)]">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[8px] text-[var(--text-tertiary)] block">Title</label>
                              <input
                                type="text"
                                value={editMilestoneTitle}
                                onChange={(e) => setEditMilestoneTitle(e.target.value)}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1 text-[11px] text-[var(--text-primary)]"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] text-[var(--text-tertiary)] block">Target Date</label>
                              <input
                                type="date"
                                value={editMilestoneDate}
                                onChange={(e) => setEditMilestoneDate(e.target.value)}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1 text-[11px] text-[var(--text-primary)]"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                updateMilestone(selectedStudentId, m.id, editMilestoneTitle, editMilestoneDate);
                                setEditingMilestoneId(null);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-0.5 rounded text-[9px]"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingMilestoneId(null)}
                              className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)] px-2 py-0.5 rounded text-[9px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="font-bold text-[var(--text-primary)] block leading-tight">{m.title}</span>
                            <span className="text-[9px] text-[var(--text-tertiary)] font-mono">Target: {m.targetDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMilestoneId(m.id);
                                setEditMilestoneTitle(m.title);
                                setEditMilestoneDate(m.targetDate);
                              }}
                              className="p-1 hover:bg-[var(--bg-secondary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                              title="Edit Milestone"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete milestone "${m.title}"?`)) {
                                  deleteMilestone(selectedStudentId, m.id);
                                }
                              }}
                              className="p-1 hover:bg-[var(--bg-secondary)] rounded text-[var(--text-secondary)] hover:text-red-500"
                              title="Delete Milestone"
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
      )}
    </div>
  );
}
