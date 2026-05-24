'use client';

import React, { useState } from 'react';
import { useAcademicStore } from '../../store/academicStore';
import { KanbanCard, User, CardCategory } from '../../types/academic';
import { getRoleBadgeStyles } from '../layout/Header';
import { 
  X, 
  Link, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Check, 
  Lock, 
  Unlock, 
  Save, 
  Send,
  ExternalLink,
  Milestone,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface CardModalProps {
  cardId: string;
  onClose: () => void;
}

export default function CardModal({ cardId, onClose }: CardModalProps) {
  const { currentUser, cards, users, columns, updateCard, approveCard, addComment, deleteCard, moveCard } = useAcademicStore();

  const card = cards[cardId];
  const [commentText, setCommentText] = useState('');

  const handleMoveToColumn = (destColId: string) => {
    if (!card) return;
    const sourceColId = card.columnId;
    const sourceCol = columns.find(c => c.id === sourceColId);
    const destCol = columns.find(c => c.id === destColId);
    if (!sourceCol || !destCol) return;
    const sourceIndex = sourceCol.cardIds.indexOf(cardId);
    const destIndex = destCol.cardIds.length;
    const res = moveCard(cardId, sourceColId, destColId, sourceIndex, destIndex);
    if (!res.success) {
      alert(res.error || 'Failed to move task.');
    } else {
      setSaveMessage(`Task moved to ${destCol.title}`);
      setTimeout(() => setSaveMessage(null), 1500);
    }
  };

  if (!card || !currentUser) return null;

  const isStaff = currentUser.role === 'PI' || currentUser.role === 'POSTDOC';
  const isAssignee = card.assigneeId === currentUser.id;
  const canEdit = isStaff || (isAssignee && card.columnId !== 'approved' && card.columnId !== 'review');

  const assigneeUser = users.find(u => u.id === card.assigneeId);
  const reviewerUser = card.approvedById ? users.find(u => u.id === card.approvedById) : null;

  const [title, setTitle] = useState(card.title);
  const [summary, setSummary] = useState(card.summary);
  const [priority, setPriority] = useState(card.priority);
  const [category, setCategory] = useState(card.category);
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [assigneeId, setAssigneeId] = useState(card.assigneeId);
  const [overleaf, setOverleaf] = useState(card.artifactLinks.overleaf || '');
  const [googleDrive, setGoogleDrive] = useState(card.artifactLinks.googleDrive || '');
  const [gitHub, setGitHub] = useState(card.artifactLinks.gitHub || '');
  const [dropbox, setDropbox] = useState(card.artifactLinks.dropbox || '');
  const [doi, setDoi] = useState(card.academicMetadata.doi || '');
  const [bibtex, setBibtex] = useState(card.academicMetadata.bibtex || '');
  const [zoteroId, setZoteroId] = useState(card.academicMetadata.zoteroId || '');
  const [targetPublication, setTargetPublication] = useState(card.academicMetadata.targetPublication || '');
  const [impactFactor, setImpactFactor] = useState(card.academicMetadata.impactFactor ? String(card.academicMetadata.impactFactor) : '');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    updateCard(cardId, {
      title, summary, priority, category,
      dueDate: dueDate || undefined,
      assigneeId,
      artifactLinks: { overleaf: overleaf || undefined, googleDrive: googleDrive || undefined, gitHub: gitHub || undefined, dropbox: dropbox || undefined },
      academicMetadata: { doi: doi || undefined, bibtex: bibtex || undefined, zoteroId: zoteroId || undefined, targetPublication: targetPublication || undefined, impactFactor: impactFactor ? parseFloat(impactFactor) : undefined }
    });
    setSaveMessage('Card updated successfully!');
    setTimeout(() => { setSaveMessage(null); }, 1500);
  };

  const handleApprove = () => {
    if (!isStaff) return;
    approveCard(cardId);
    setSaveMessage('Card approved and moved to Approved column!');
    setTimeout(() => { setSaveMessage(null); onClose(); }, 1500);
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(cardId, commentText);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4 shadow-2xl relative glow-accent animate-in fade-in duration-200">
        <button onClick={onClose} className="absolute right-3 top-3 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-primary)] mb-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[var(--accent-bg)] text-[var(--accent)] font-bold px-1.5 rounded font-mono uppercase">{card.category.replace('_', ' ')}</span>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono">
              <span>Card ID: {card.id}</span>
              <span>•</span>
              <span>Status: <strong className="text-[var(--text-primary)] capitalize">{card.columnId.replace('_', ' ')}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {card.columnId === 'approved' ? (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 border border-emerald-500/20 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> PI Approved by {reviewerUser?.name.split(' ').pop()}
              </span>
            ) : card.approvalRequested ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 border border-amber-500/20 rounded flex items-center gap-1 animate-pulse">
                  <Lock className="w-3.5 h-3.5" /> Under PI/Postdoc Review
                </span>
                {isStaff && (
                  <button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1 rounded transition-all cursor-pointer shadow-sm">Approve & Lock</button>
                )}
              </div>
            ) : (
              <span className="text-[10px] bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <Unlock className="w-3.5 h-3.5 text-[var(--accent)]" /> Editable Draft
              </span>
            )}
          </div>
        </div>

        {!canEdit && (
          <div className="mb-4 bg-slate-500/10 border border-slate-500/20 text-[11px] text-[var(--text-secondary)] px-3 py-2 rounded flex items-center gap-2 leading-relaxed">
            <Lock className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span><strong>Read-Only Mode:</strong> This task has been submitted or finalized. Editing requires PI or Postdoc administrative roles.</span>
          </div>
        )}

        {saveMessage && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded flex items-center gap-2 glow-accent font-semibold">
            <Check className="w-4 h-4 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Task Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!canEdit} required className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-60" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Abstract / Summary Block</label>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} disabled={!canEdit} required rows={3} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-60 leading-relaxed" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as any)} disabled={!canEdit} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none disabled:opacity-60">
                    <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={!canEdit} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none disabled:opacity-60" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Assignee</label>
                  <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} disabled={!canEdit} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none disabled:opacity-60 font-semibold">
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role.split('_')[0]})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as CardCategory)} disabled={!canEdit} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1.5 text-xs text-[var(--text-primary)] focus:outline-none disabled:opacity-60">
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
              {canEdit && (
                <div className="flex gap-2 w-full flex-wrap">
                  <button type="submit" className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1.5 transition-all cursor-pointer shadow-sm">
                    <Save className="w-3.5 h-3.5" /> Save Properties
                  </button>
                  {(card.columnId === 'inbox' || card.columnId === 'in_progress') && (
                    <button type="button" onClick={() => handleMoveToColumn('review')} className="bg-indigo-950 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-bg)] text-xs font-bold py-1.5 px-3 rounded transition-all cursor-pointer shadow-sm">Submit for Review</button>
                  )}
                  {card.columnId === 'inbox' && (
                    <button type="button" onClick={() => handleMoveToColumn('in_progress')} className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] text-xs font-bold py-1.5 px-3 rounded transition-all cursor-pointer shadow-sm">Start Work</button>
                  )}
                  {card.columnId === 'review' && isStaff && (
                    <button type="button" onClick={() => handleMoveToColumn('in_progress')} className="bg-amber-600/10 text-amber-600 border border-amber-600/25 hover:bg-amber-600/20 text-xs font-bold py-1.5 px-3 rounded transition-all cursor-pointer shadow-sm">Return to Active Draft</button>
                  )}
                  <button type="button" onClick={() => { if (window.confirm('Are you sure you want to delete this task?')) { deleteCard(cardId); onClose(); } }} className="bg-red-650 hover:bg-red-500 text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ml-auto">
                    <Trash2 className="w-3.5 h-3.5" /> Delete Task
                  </button>
                </div>
              )}
            </form>

            <div className="pt-3 border-t border-[var(--border-primary)]">
              <div className="flex items-center gap-1.5 mb-2">
                <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">Feedback & Comments ({card.comments.length})</h4>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3 pr-1">
                {card.comments.length === 0 ? (
                  <div className="text-center py-4 text-[var(--text-tertiary)] text-[11px] italic">No supervisor or student comments added.</div>
                ) : (
                  card.comments.map(c => {
                    const author = users.find(u => u.id === c.authorId);
                    const authorRoleBadge = author ? getRoleBadgeStyles(author.role) : null;
                    return (
                      <div key={c.id} className="bg-[var(--bg-secondary)] border border-[var(--border-primary)]/50 rounded p-2 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[var(--text-primary)]">{c.authorName}</span>
                            {authorRoleBadge && <span className={`text-[7px] border px-1 rounded ${authorRoleBadge.bg}`}>{authorRoleBadge.label.split(' ')[0]}</span>}
                          </div>
                          <span className="text-[9px] text-[var(--text-tertiary)] font-mono">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{c.content}</p>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={handleAddCommentSubmit} className="flex gap-2">
                <input type="text" placeholder="Ask a question or request review..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" />
                <button type="submit" className="bg-indigo-950 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-bg)] p-1.5 rounded transition-all cursor-pointer flex items-center justify-center shrink-0" title="Send Comment">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-panel p-3 rounded-lg border border-[var(--border-primary)] space-y-3">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-[var(--border-primary)]/70">
                <Link className="w-4 h-4 text-[var(--accent)]" />
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">Artifact Integrations</h4>
              </div>
              <div className="space-y-2.5">
                {[['Overleaf LaTeX URL', overleaf, setOverleaf, 'https://www.overleaf.com/project/...', 'Open Project'], ['Google Drive / Dropbox', googleDrive, setGoogleDrive, 'https://drive.google.com/drive/folders/...', 'Open Folder'], ['GitHub Repository', gitHub, setGitHub, 'https://github.com/username/repo...', 'Open Repo']].map(([label, val, setter, ph, linkText]) => (
                  <div key={label as string}>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block">{label as string}</label>
                      {(val as string) && <a href={val as string} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[var(--accent)] hover:underline flex items-center gap-0.5">{linkText as string} <ExternalLink className="w-2.5 h-2.5" /></a>}
                    </div>
                    <input type="url" value={val as string} onChange={(e) => (setter as Function)(e.target.value)} disabled={!canEdit} placeholder={ph as string} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-60 font-mono" />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-3 rounded-lg border border-[var(--border-primary)] space-y-3">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-[var(--border-primary)]/70">
                <BookOpen className="w-4 h-4 text-[var(--accent)]" />
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">Academic Citation Metadata</h4>
              </div>
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-0.5">DOI</label>
                    <input type="text" value={doi} onChange={(e) => setDoi(e.target.value)} disabled={!canEdit} placeholder="e.g. 10.1021/acs.est..." className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1 text-xs text-[var(--text-primary)] focus:outline-none disabled:opacity-60 font-mono" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-0.5">Zotero Reference Key</label>
                    <input type="text" value={zoteroId} onChange={(e) => setZoteroId(e.target.value)} disabled={!canEdit} placeholder="e.g. DIANA2026_BIOCHAR" className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1 text-xs text-[var(--text-primary)] focus:outline-none disabled:opacity-60 font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-0.5">Target Publication</label>
                    <input type="text" value={targetPublication} onChange={(e) => setTargetPublication(e.target.value)} disabled={!canEdit} placeholder="e.g. Chemosphere" className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1 text-xs text-[var(--text-primary)] focus:outline-none disabled:opacity-60" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-0.5">Impact Factor</label>
                    <input type="number" step="0.1" value={impactFactor} onChange={(e) => setImpactFactor(e.target.value)} disabled={!canEdit} placeholder="8.8" className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1 text-xs text-[var(--text-primary)] focus:outline-none disabled:opacity-60 font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase block mb-0.5">BibTeX Text Snippet</label>
                  <textarea value={bibtex} onChange={(e) => setBibtex(e.target.value)} disabled={!canEdit} placeholder="@article{diana2026, ...}" rows={3} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded p-1 text-[10px] text-[var(--text-primary)] focus:outline-none disabled:opacity-60 font-mono leading-normal" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-primary)]/70 text-xs">
              <span className="text-[10px] font-bold text-[var(--text-primary)] block mb-1">Supervisory Approval Flow</span>
              <p className="text-[10.5px] text-[var(--text-secondary)] leading-relaxed">When a draft is ready, the assignee moves the card to the <strong className="text-[var(--text-primary)]">Submitted for Review</strong> column. The card is immediately locked. Prof. Pendelton or Dr. Beatrice Vance must click <strong className="text-[var(--text-primary)]">Approve & Lock</strong> to finalize.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
