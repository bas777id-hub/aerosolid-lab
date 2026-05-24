export type UserRole =
  | 'PI'
  | 'POSTDOC'
  | 'PHD_STUDENT'
  | 'MASTER_STUDENT'
  | 'BACHELOR_STUDENT'
  | 'LAB_ASSISTANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  joinedDate: string;
  password?: string;
  // Specific to students
  thesisTitle?: string;
  advisorId?: string;
}

export interface ArtifactLinks {
  overleaf?: string;
  googleDrive?: string;
  gitHub?: string;
  dropbox?: string;
}

export interface AcademicMetadata {
  doi?: string;
  bibtex?: string;
  zoteroId?: string;
  targetPublication?: string;
  impactFactor?: number;
}

export type CardCategory =
  | 'LITERATURE_REVIEW'
  | 'PROPOSAL'
  | 'METHODOLOGY'
  | 'EXPERIMENTATION'
  | 'WRITING'
  | 'DEFENSE_PREP'
  | 'LOGISTICS'
  | 'COMPLIANCE'
  | 'OTHER';

export interface KanbanCard {
  id: string;
  title: string;
  summary: string;
  columnId: string;
  assigneeId: string; // User ID
  category: CardCategory;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate?: string; // YYYY-MM-DD
  artifactLinks: ArtifactLinks;
  academicMetadata: AcademicMetadata;
  // Approval states
  isApproved: boolean; // Approved by PI or Postdoc
  approvedById?: string; // User ID of the reviewer
  approvalRequested: boolean;
  comments: Comment[];
  // History of card movement
  updatedAt: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  isApprovalGate: boolean; // Flag to lock transitions into/out without approval
  cardIds: string[];
}

export type MilestoneStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED_TO_PI'
  | 'APPROVED'
  | 'OVERDUE';

export interface Milestone {
  id: string;
  title: string;
  targetDate: string; // YYYY-MM-DD
  status: MilestoneStatus;
  linkedCardIds: string[]; // Kanban cards linked to this milestone
}

export type DefenseType = 'BACHELOR_THESIS' | 'MASTER_THESIS' | 'PHD_DISSERTATION';

export interface AcademicMilestoneTrack {
  id: string;
  studentId: string;
  defenseType: DefenseType;
  targetGraduationWindow: string; // e.g. "Semester Ganjil 2026"
  milestones: Milestone[];
  overallStatus: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL_STAGNATION';
  requiredVelocity: number; // Cards per week needed
  actualVelocity: number; // Cards approved over the last 14 days / 2
}

export interface TeachingSchedule {
  courseId: string;
  courseName: string;
  recurrence: {
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    classroom: string;
  }[];
}

export interface ResearchActivity {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  linkedCardId?: string;
  type: 'MEETING' | 'DEFENSE' | 'SEMINAR' | 'LAB_WORK' | 'DEADLINE';
  zoomMeeting?: {
    joinUrl: string;
    meetingId: string;
    passcode: string;
  };
}

export interface PersonalTask {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
  notes?: string;
}
