import { create } from 'zustand';
import {
  User,
  UserRole,
  KanbanCard,
  KanbanColumn,
  AcademicMilestoneTrack,
  TeachingSchedule,
  ResearchActivity,
  MilestoneStatus,
  CardCategory,
  PersonalTask
} from '../types/academic';

interface AcademicState {
  // Users and Auth Simulation
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  authError?: string;
  
  // Kanban Board
  columns: KanbanColumn[];
  cards: Record<string, KanbanCard>;
  
  // Student Tracks
  studentTracks: Record<string, AcademicMilestoneTrack>; // keyed by studentId
  
  // Calendar and Schedule
  teachingSchedules: Record<string, TeachingSchedule>; // keyed by instructorId (PI, Postdoc)
  researchActivities: ResearchActivity[];
  personalTasks: PersonalTask[];
  loadPersonalTasks: () => void;
  addPersonalTask: (title: string, dueDate?: string, notes?: string) => void;
  togglePersonalTask: (taskId: string) => void;
  deletePersonalTask: (taskId: string) => void;
  updatePersonalTask: (taskId: string, title: string, dueDate?: string, notes?: string) => void;
  
  // Navigation View
  currentView: 'DASHBOARD' | 'KANBAN' | 'CALENDAR' | 'LOGISTICS' | 'ADMIN';
  theme: 'light' | 'dark' | 'system';
  fontSizeMultiplier: number;
  
  // Actions
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setFontSizeMultiplier: (multiplier: number) => void;
  setCurrentUser: (userId: string) => void;
  setCurrentView: (view: 'DASHBOARD' | 'KANBAN' | 'CALENDAR' | 'LOGISTICS' | 'ADMIN') => void;
  
  // Profile Management
  updateUserProfile: (name: string, email: string, password?: string, thesisTitle?: string) => void;
  
  // Account (Roster) Management
  inviteUser: (user: Omit<User, 'id' | 'joinedDate'>) => void;
  updateUser: (userId: string, updatedFields: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  
  moveCard: (
    cardId: string,
    sourceColId: string,
    destColId: string,
    sourceIndex: number,
    destIndex: number
  ) => { success: boolean; error?: string };
  updateCard: (cardId: string, updatedFields: Partial<KanbanCard>) => void;
  approveCard: (cardId: string) => void;
  addComment: (cardId: string, content: string) => void;
  addCard: (title: string, summary: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', category: CardCategory, assigneeId: string, columnId?: string) => void;
  deleteCard: (cardId: string) => void;
  updateMilestoneStatus: (studentId: string, milestoneId: string, status: MilestoneStatus) => void;
  addMilestone: (studentId: string, title: string, targetDate: string) => void;
  deleteMilestone: (studentId: string, milestoneId: string) => void;
  updateMilestone: (studentId: string, milestoneId: string, title: string, targetDate: string) => void;
  addResearchActivity: (activity: ResearchActivity) => void;
  updateResearchActivity: (activityId: string, date: string, startTime: string, endTime: string) => void;
  deleteResearchActivity: (activityId: string) => void;
  recalculateVelocities: () => void;
}

// Initial Mock Users
const mockUsers: User[] = [
  {
    id: 'u-pi',
    name: 'Prof. Arthur Pendelton',
    email: 'a.pendelton@university.edu',
    role: 'PI',
    avatarUrl: '/avatars/pi.png',
    joinedDate: '2015-09-01',
    password: 'pendelton'
  },
  {
    id: 'u-postdoc',
    name: 'Dr. Beatrice Vance',
    email: 'b.vance@university.edu',
    role: 'POSTDOC',
    avatarUrl: '/avatars/postdoc.png',
    joinedDate: '2023-01-15',
    password: 'vance'
  },
  {
    id: 'u-phd-carl',
    name: 'Carl Sagan',
    email: 'c.sagan@university.edu',
    role: 'PHD_STUDENT',
    avatarUrl: '/avatars/phd.png',
    joinedDate: '2024-09-01',
    thesisTitle: 'Spatio-temporal Modeling of Environmental Contaminants',
    advisorId: 'u-pi',
    password: 'sagan'
  },
  {
    id: 'u-master-diana',
    name: 'Diana Prince',
    email: 'd.prince@university.edu',
    role: 'MASTER_STUDENT',
    avatarUrl: '/avatars/master.png',
    joinedDate: '2025-01-10',
    thesisTitle: 'Heavy Metal Remediation using Bio-absorbents',
    advisorId: 'u-pi',
    password: 'prince'
  },
  {
    id: 'u-bachelor-ethan',
    name: 'Ethan Hunt',
    email: 'e.hunt@university.edu',
    role: 'BACHELOR_STUDENT',
    avatarUrl: '/avatars/bachelor.png',
    joinedDate: '2025-09-01',
    thesisTitle: 'Design of a Benchtop Soil Column Tester',
    advisorId: 'u-postdoc',
    password: 'hunt'
  },
  {
    id: 'u-assistant-fiona',
    name: 'Fiona Gallagher',
    email: 'f.gallagher@university.edu',
    role: 'LAB_ASSISTANT',
    avatarUrl: '/avatars/assistant.png',
    joinedDate: '2022-06-01',
    password: 'gallagher'
  }
];

// Initial Columns
const initialColumns: KanbanColumn[] = [
  { id: 'inbox', title: 'Inbox / Backlog', isApprovalGate: false, cardIds: ['card-1', 'card-4', 'card-7'] },
  { id: 'in_progress', title: 'Active Work', isApprovalGate: false, cardIds: ['card-2', 'card-5', 'card-8'] },
  { id: 'review', title: 'Submitted for Review', isApprovalGate: true, cardIds: ['card-3', 'card-6'] },
  { id: 'approved', title: 'PI Approved', isApprovalGate: true, cardIds: ['card-9'] }
];

// Initial Cards
const initialCards: Record<string, KanbanCard> = {
  'card-1': {
    id: 'card-1',
    title: 'Literature Synthesis on Soil Columns',
    summary: 'Synthesize literature from 2018-2025 on benchtop soil column designs and fluid dynamics models.',
    columnId: 'inbox',
    assigneeId: 'u-bachelor-ethan',
    category: 'LITERATURE_REVIEW',
    priority: 'HIGH',
    dueDate: '2026-05-30',
    artifactLinks: {
      overleaf: 'https://www.overleaf.com/project/64f1234b567c',
      googleDrive: 'https://drive.google.com/drive/folders/1abc9876xyz'
    },
    academicMetadata: {
      zoteroId: 'ETHAN2026_SOIL',
      targetPublication: 'Environmental Testing Journal'
    },
    isApproved: false,
    approvalRequested: false,
    comments: [
      {
        id: 'c-1',
        authorId: 'u-postdoc',
        authorName: 'Dr. Beatrice Vance',
        content: 'Focus on ASTM standard parameters for soil columns.',
        createdAt: '2026-05-20T10:00:00Z'
      }
    ],
    updatedAt: '2026-05-24T10:00:00Z',
    createdAt: '2026-05-15T09:00:00Z'
  },
  'card-2': {
    id: 'card-2',
    title: 'Solid Edge CAD Blueprinting',
    summary: 'Design CAD components for soil cylinder container, top mesh cap, and bottom pressure fitting.',
    columnId: 'in_progress',
    assigneeId: 'u-bachelor-ethan',
    category: 'METHODOLOGY',
    priority: 'MEDIUM',
    dueDate: '2026-06-08',
    artifactLinks: {
      gitHub: 'https://github.com/ethanhunt-lab/soil-column-blueprint'
    },
    academicMetadata: {},
    isApproved: false,
    approvalRequested: false,
    comments: [],
    updatedAt: '2026-05-23T14:30:00Z',
    createdAt: '2026-05-18T11:00:00Z'
  },
  'card-3': {
    id: 'card-3',
    title: 'Flow Calibration Calibration Reports',
    summary: 'Submit flow rate measurement data and draft calibration section for Proposal Defense.',
    columnId: 'review',
    assigneeId: 'u-bachelor-ethan',
    category: 'EXPERIMENTATION',
    priority: 'CRITICAL',
    dueDate: '2026-05-27',
    artifactLinks: {
      googleDrive: 'https://drive.google.com/drive/folders/1calibrationreports'
    },
    academicMetadata: {
      targetPublication: 'ASCE Journal of Geotechnical Engineering'
    },
    isApproved: false,
    approvalRequested: true,
    comments: [
      {
        id: 'c-2',
        authorId: 'u-bachelor-ethan',
        authorName: 'Ethan Hunt',
        content: 'I uploaded the Excel files to Drive. Please review the discharge curves.',
        createdAt: '2026-05-24T08:00:00Z'
      }
    ],
    updatedAt: '2026-05-24T08:00:00Z',
    createdAt: '2026-05-10T14:00:00Z'
  },
  'card-4': {
    id: 'card-4',
    title: 'Bio-absorbent Activation Protocol',
    summary: 'Standardize chemical activation protocol of coconut shell biochar using 0.5M NaOH.',
    columnId: 'inbox',
    assigneeId: 'u-master-diana',
    category: 'METHODOLOGY',
    priority: 'HIGH',
    dueDate: '2026-06-05',
    artifactLinks: {
      googleDrive: 'https://drive.google.com/drive/folders/2biocharactivation'
    },
    academicMetadata: {
      zoteroId: 'DIANA2026_BIOCHAR'
    },
    isApproved: false,
    approvalRequested: false,
    comments: [],
    updatedAt: '2026-05-21T09:00:00Z',
    createdAt: '2026-05-20T08:30:00Z'
  },
  'card-5': {
    id: 'card-5',
    title: 'Batch Adsorption Kinetic Assays',
    summary: 'Measure Lead (Pb) removal rate over time intervals: 5, 10, 30, 60, 120, 240 mins.',
    columnId: 'in_progress',
    assigneeId: 'u-master-diana',
    category: 'EXPERIMENTATION',
    priority: 'HIGH',
    dueDate: '2026-05-29',
    artifactLinks: {
      gitHub: 'https://github.com/dianaprince-lab/batch-adsorption-kinetics'
    },
    academicMetadata: {
      targetPublication: 'Journal of Hazardous Materials',
      impactFactor: 13.6
    },
    isApproved: false,
    approvalRequested: false,
    comments: [
      {
        id: 'c-3',
        authorId: 'u-pi',
        authorName: 'Prof. Arthur Pendelton',
        content: 'Ensure pH is maintained at exactly 5.5 to prevent hydroxide precipitation.',
        createdAt: '2026-05-23T11:00:00Z'
      }
    ],
    updatedAt: '2026-05-24T09:15:00Z',
    createdAt: '2026-05-12T10:00:00Z'
  },
  'card-6': {
    id: 'card-6',
    title: 'Manuscript Draft: Biochar Adsorption Mechanisms',
    summary: 'Write introduction, experimental section, and plot isotherms (Langmuir/Freundlich models) for submission.',
    columnId: 'review',
    assigneeId: 'u-master-diana',
    category: 'WRITING',
    priority: 'CRITICAL',
    dueDate: '2026-05-28',
    artifactLinks: {
      overleaf: 'https://www.overleaf.com/project/64f98765432a'
    },
    academicMetadata: {
      targetPublication: 'Chemosphere',
      impactFactor: 8.8
    },
    isApproved: false,
    approvalRequested: true,
    comments: [
      {
        id: 'c-4',
        authorId: 'u-master-diana',
        authorName: 'Diana Prince',
        content: 'Completed the modeling. Langmuir fits better with R2 = 0.992.',
        createdAt: '2026-05-24T12:00:00Z'
      }
    ],
    updatedAt: '2026-05-24T12:00:00Z',
    createdAt: '2026-05-01T09:00:00Z'
  },
  'card-7': {
    id: 'card-7',
    title: 'Spatiotemporal Kriging Interpolation',
    summary: 'Develop R-script utilizing the gstat package for kriging modeling of chromium plume.',
    columnId: 'inbox',
    assigneeId: 'u-phd-carl',
    category: 'METHODOLOGY',
    priority: 'MEDIUM',
    dueDate: '2026-06-12',
    artifactLinks: {
      gitHub: 'https://github.com/carlsagan-phd/spatiotemporal-kriging'
    },
    academicMetadata: {},
    isApproved: false,
    approvalRequested: false,
    comments: [],
    updatedAt: '2026-05-20T10:00:00Z',
    createdAt: '2026-05-18T10:00:00Z'
  },
  'card-8': {
    id: 'card-8',
    title: 'Model Validation against Field Samples',
    summary: 'Validate prediction algorithm using 50 core samples from the Hanford site.',
    columnId: 'in_progress',
    assigneeId: 'u-phd-carl',
    category: 'EXPERIMENTATION',
    priority: 'HIGH',
    dueDate: '2026-06-03',
    artifactLinks: {
      googleDrive: 'https://drive.google.com/drive/folders/3hanfordvalidation'
    },
    academicMetadata: {
      targetPublication: 'Environmental Science & Technology',
      impactFactor: 11.4
    },
    isApproved: false,
    approvalRequested: false,
    comments: [],
    updatedAt: '2026-05-24T11:00:00Z',
    createdAt: '2026-05-05T09:00:00Z'
  },
  'card-9': {
    id: 'card-9',
    title: 'Paper 1: Contaminant Transport Dynamics',
    summary: 'Final revisions accepted. Paper details dynamics of chromium infiltration under transient rain events.',
    columnId: 'approved',
    assigneeId: 'u-phd-carl',
    category: 'WRITING',
    priority: 'CRITICAL',
    dueDate: '2026-05-10',
    artifactLinks: {},
    academicMetadata: {
      doi: '10.1021/acs.est.6b01234',
      targetPublication: 'Environmental Science & Technology',
      impactFactor: 11.4
    },
    isApproved: true,
    approvedById: 'u-pi',
    approvalRequested: false,
    comments: [
      {
        id: 'c-5',
        authorId: 'u-pi',
        authorName: 'Prof. Arthur Pendelton',
        content: 'Outstanding work. The reviewer critiques were successfully addressed.',
        createdAt: '2026-05-09T15:00:00Z'
      }
    ],
    updatedAt: '2026-05-10T09:00:00Z',
    createdAt: '2026-03-01T09:00:00Z'
  }
};

// Initial Milestone Tracks
const initialStudentTracks: Record<string, AcademicMilestoneTrack> = {
  'u-bachelor-ethan': {
    id: 't-ethan',
    studentId: 'u-bachelor-ethan',
    defenseType: 'BACHELOR_THESIS',
    targetGraduationWindow: 'Semester Genap 2026',
    milestones: [
      { id: 'm-e1', title: 'Literature Review', targetDate: '2026-05-15', status: 'APPROVED', linkedCardIds: ['card-1'] },
      { id: 'm-e2', title: 'Proposal Defense', targetDate: '2026-05-25', status: 'IN_PROGRESS', linkedCardIds: ['card-3'] },
      { id: 'm-e3', title: 'Progress Seminar', targetDate: '2026-06-10', status: 'NOT_STARTED', linkedCardIds: ['card-2'] },
      { id: 'm-e4', title: 'Final Thesis Defense', targetDate: '2026-06-25', status: 'NOT_STARTED', linkedCardIds: [] },
      { id: 'm-e5', title: 'Camera-Ready Submission', targetDate: '2026-07-10', status: 'NOT_STARTED', linkedCardIds: [] }
    ],
    overallStatus: 'ON_TRACK',
    requiredVelocity: 0.8,
    actualVelocity: 0.5
  },
  'u-master-diana': {
    id: 't-diana',
    studentId: 'u-master-diana',
    defenseType: 'MASTER_THESIS',
    targetGraduationWindow: 'Semester Genap 2026',
    milestones: [
      { id: 'm-d1', title: 'Literature Review', targetDate: '2026-04-30', status: 'APPROVED', linkedCardIds: [] },
      { id: 'm-d2', title: 'Proposal Defense', targetDate: '2026-05-15', status: 'APPROVED', linkedCardIds: [] },
      { id: 'm-d3', title: 'Progress Seminar', targetDate: '2026-06-01', status: 'IN_PROGRESS', linkedCardIds: ['card-4'] },
      { id: 'm-d4', title: 'Final Thesis Defense', targetDate: '2026-06-20', status: 'NOT_STARTED', linkedCardIds: ['card-5', 'card-6'] },
      { id: 'm-d5', title: 'Camera-Ready Submission', targetDate: '2026-07-05', status: 'NOT_STARTED', linkedCardIds: [] }
    ],
    overallStatus: 'AT_RISK',
    requiredVelocity: 1.5,
    actualVelocity: 0.0
  },
  'u-phd-carl': {
    id: 't-carl',
    studentId: 'u-phd-carl',
    defenseType: 'PHD_DISSERTATION',
    targetGraduationWindow: 'Semester Ganjil 2027',
    milestones: [
      { id: 'm-c1', title: 'Literature Synthesis', targetDate: '2026-04-10', status: 'APPROVED', linkedCardIds: [] },
      { id: 'm-c2', title: 'Paper 1 Contaminant Dynamics', targetDate: '2026-05-15', status: 'APPROVED', linkedCardIds: ['card-9'] },
      { id: 'm-c3', title: 'Paper 2 Kriging Simulation', targetDate: '2026-06-30', status: 'IN_PROGRESS', linkedCardIds: ['card-7', 'card-8'] },
      { id: 'm-c4', title: 'Dissertation Proposal Defense', targetDate: '2026-11-15', status: 'NOT_STARTED', linkedCardIds: [] },
      { id: 'm-c5', title: 'Final Dissertation Defense', targetDate: '2027-06-20', status: 'NOT_STARTED', linkedCardIds: [] }
    ],
    overallStatus: 'ON_TRACK',
    requiredVelocity: 0.1,
    actualVelocity: 0.5
  }
};

// Teaching Schedules (locked/fixed for PI)
const mockTeachingSchedules: Record<string, TeachingSchedule> = {
  'u-pi': {
    courseId: 'ENV-602',
    courseName: 'Environmental Remediation',
    recurrence: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '12:00', classroom: 'Lecture Hall 402' }, // Monday
      { dayOfWeek: 3, startTime: '14:00', endTime: '16:00', classroom: 'Seminar Room 105' }  // Wednesday
    ]
  },
  'u-postdoc': {
    courseId: 'ENV-301',
    courseName: 'Basic Fluid Mechanics Lab',
    recurrence: [
      { dayOfWeek: 2, startTime: '09:00', endTime: '12:00', classroom: 'Hydraulics Lab 202' } // Tuesday
    ]
  }
};

// Research Activities (draggable calendar events)
const initialResearchActivities: ResearchActivity[] = [
  {
    id: 'a-1',
    title: 'Group Progress Meeting',
    description: 'Weekly presentation of experiments and manuscript updates by all students.',
    date: '2026-05-28', // Thursday
    startTime: '13:00',
    endTime: '15:00',
    type: 'MEETING'
  },
  {
    id: 'a-2',
    title: 'Diana Isotherm Calibration Study',
    description: 'Adsorption kinetics instrumentation training with Dr. Beatrice Vance.',
    date: '2026-05-25', // Monday
    startTime: '10:30', // Overlaps with Environmental Remediation course of PI (10:00 - 12:00)
    endTime: '12:00',
    type: 'LAB_WORK'
  },
  {
    id: 'a-3',
    title: 'Ethan Proposal Pre-defense Review',
    description: 'Dry run presentation of Soil Column blueprints with Dr. Beatrice.',
    date: '2026-05-27', // Wednesday
    startTime: '14:30', // Overlaps with Advanced Soil Mechanics course of PI (14:00 - 16:00)
    endTime: '15:30',
    type: 'SEMINAR'
  },
  {
    id: 'a-4',
    title: 'Ethan Hunt Proposal Defense',
    description: 'Official presentation of Ethan\'s Bachelor Thesis proposal.',
    date: '2026-05-29', // Friday
    startTime: '10:00',
    endTime: '12:00',
    type: 'DEFENSE',
    linkedCardId: 'card-3'
  }
];

const initialPersonalTasks = [
  {
    id: 'pt-1',
    userId: 'u-phd-carl',
    title: 'Download and review gstat tutorial',
    completed: true,
    dueDate: '2026-05-24',
    notes: 'Important for Kriging simulation development.'
  },
  {
    id: 'pt-2',
    userId: 'u-phd-carl',
    title: 'Re-run chromium grid model validation tests',
    completed: false,
    dueDate: '2026-05-28',
    notes: 'Need to cross check parameters with Beatrice.'
  },
  {
    id: 'pt-3',
    userId: 'u-pi',
    title: 'Prepare NSF-ENV-26 quarterly report',
    completed: false,
    dueDate: '2026-05-30',
    notes: 'Requires student velocity metrics aggregated from the dashboard.'
  },
  {
    id: 'pt-4',
    userId: 'u-master-diana',
    title: 'Autoclave biochar samples for isotherm runs',
    completed: false,
    dueDate: '2026-05-26',
    notes: 'Check autoclave reservation calendar first.'
  }
];

export const useAcademicStore = create<AcademicState>((set, get) => ({
  currentUser: null, // Start as unauthenticated
  users: mockUsers,
  isAuthenticated: false,
  authError: undefined,
  columns: initialColumns,
  cards: initialCards,
  studentTracks: initialStudentTracks,
  teachingSchedules: mockTeachingSchedules,
  researchActivities: initialResearchActivities,
  personalTasks: initialPersonalTasks,
  currentView: 'DASHBOARD',
  theme: 'system',
  fontSizeMultiplier: 1.0,

  login: (email, password) => {
    const user = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.password === password) {
      set({ currentUser: user, isAuthenticated: true, authError: undefined });
      return true;
    }
    set({ authError: 'Invalid email or password.' });
    return false;
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false, currentView: 'DASHBOARD' });
  },

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura-theme', theme);
      const root = document.documentElement;
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.setAttribute('data-theme', systemTheme);
      } else {
        root.setAttribute('data-theme', theme);
      }
    }
  },

  setFontSizeMultiplier: (multiplier) => {
    set({ fontSizeMultiplier: multiplier });
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura-font-size-multiplier', String(multiplier));
      const root = document.documentElement;
      root.style.fontSize = `${32 * multiplier}px`;
    }
  },

  setCurrentUser: (userId) => {
    const user = get().users.find((u) => u.id === userId);
    if (user) {
      set({ currentUser: user, isAuthenticated: true, authError: undefined });
    }
  },

  setCurrentView: (view) => {
    set({ currentView: view });
  },

  updateUserProfile: (name, email, password, thesisTitle) => {
    const { currentUser, users } = get();
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      name,
      email,
      ...(password ? { password } : {}),
      ...(thesisTitle ? { thesisTitle } : {})
    };

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);

    set({
      currentUser: updatedUser,
      users: updatedUsers
    });
  },

  inviteUser: (newUserFields) => {
    const { currentUser, users, studentTracks } = get();
    if (!currentUser || (currentUser.role !== 'PI' && currentUser.role !== 'POSTDOC')) {
      return;
    }

    const newId = `u-${Date.now()}`;
    const newUser: User = {
      ...newUserFields,
      id: newId,
      joinedDate: new Date().toISOString().split('T')[0],
      password: newUserFields.name.split(' ').pop()?.toLowerCase() || 'password'
    };

    // Add student track if role is a student
    const updatedStudentTracks = { ...studentTracks };
    if (newUser.role.includes('STUDENT')) {
      const isBachelor = newUser.role === 'BACHELOR_STUDENT';
      const isMaster = newUser.role === 'MASTER_STUDENT';
      
      const defenseType = isBachelor ? 'BACHELOR_THESIS' : isMaster ? 'MASTER_THESIS' : 'PHD_DISSERTATION';
      const defaultMilestones = isBachelor
        ? [
            { id: `m-${newId}-1`, title: 'Literature Review', targetDate: '2026-09-15', status: 'NOT_STARTED' as const, linkedCardIds: [] },
            { id: `m-${newId}-2`, title: 'Proposal Defense', targetDate: '2026-10-15', status: 'NOT_STARTED' as const, linkedCardIds: [] },
            { id: `m-${newId}-3`, title: 'Progress Seminar', targetDate: '2026-12-10', status: 'NOT_STARTED' as const, linkedCardIds: [] },
            { id: `m-${newId}-4`, title: 'Final Thesis Defense', targetDate: '2027-02-15', status: 'NOT_STARTED' as const, linkedCardIds: [] },
            { id: `m-${newId}-5`, title: 'Camera-Ready Submission', targetDate: '2027-03-01', status: 'NOT_STARTED' as const, linkedCardIds: [] }
          ]
        : isMaster
        ? [
            { id: `m-${newId}-1`, title: 'Literature Review', targetDate: '2026-09-15', status: 'NOT_STARTED' as const, linkedCardIds: [] },
            { id: `m-${newId}-2`, title: 'Proposal Defense', targetDate: '2026-10-30', status: 'NOT_STARTED' as const, linkedCardIds: [] },
            { id: `m-${newId}-3`, title: 'Progress Seminar', targetDate: '2026-12-20', status: 'NOT_STARTED' as const, linkedCardIds: [] },
            { id: `m-${newId}-4`, title: 'Final Thesis Defense', targetDate: '2027-04-15', status: 'NOT_STARTED' as const, linkedCardIds: [] },
            { id: `m-${newId}-5`, title: 'Camera-Ready Submission', targetDate: '2027-05-01', status: 'NOT_STARTED' as const, linkedCardIds: [] }
          ]
        : [
            { id: `m-${newId}-1`, title: 'Literature Synthesis', targetDate: '2026-12-15', status: 'NOT_STARTED' as const, linkedCardIds: [] },
            { id: `m-${newId}-2`, title: 'Paper 1 Drafting', targetDate: '2027-06-15', status: 'NOT_STARTED' as const, linkedCardIds: [] },
            { id: `m-${newId}-3`, title: 'Paper 2 Drafting', targetDate: '2027-12-15', status: 'NOT_STARTED' as const, linkedCardIds: [] },
            { id: `m-${newId}-4`, title: 'Dissertation Proposal Defense', targetDate: '2028-06-15', status: 'NOT_STARTED' as const, linkedCardIds: [] },
            { id: `m-${newId}-5`, title: 'Final Dissertation Defense', targetDate: '2029-06-15', status: 'NOT_STARTED' as const, linkedCardIds: [] }
          ];

      updatedStudentTracks[newId] = {
        id: `t-${newId}`,
        studentId: newId,
        defenseType,
        targetGraduationWindow: 'Semester Ganjil 2027',
        milestones: defaultMilestones,
        overallStatus: 'ON_TRACK',
        requiredVelocity: 0,
        actualVelocity: 0
      };
    }

    set({
      users: [...users, newUser],
      studentTracks: updatedStudentTracks
    });
    
    get().recalculateVelocities();
  },

  updateUser: (userId, updatedFields) => {
    const { currentUser, users } = get();
    if (!currentUser || (currentUser.role !== 'PI' && currentUser.role !== 'POSTDOC')) {
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        return { ...u, ...updatedFields };
      }
      return u;
    });

    set({
      users: updatedUsers,
      currentUser: currentUser.id === userId ? { ...currentUser, ...updatedFields } : currentUser
    });
  },

  deleteUser: (userId) => {
    const { currentUser, users, studentTracks } = get();
    if (!currentUser || (currentUser.role !== 'PI' && currentUser.role !== 'POSTDOC')) {
      return;
    }

    const updatedUsers = users.filter((u) => u.id !== userId);
    const updatedStudentTracks = { ...studentTracks };
    delete updatedStudentTracks[userId];

    set({
      users: updatedUsers,
      studentTracks: updatedStudentTracks
    });
  },

  moveCard: (cardId, sourceColId, destColId, sourceIndex, destIndex) => {
    const { currentUser, cards, columns } = get();
    if (!currentUser) {
      return { success: false, error: 'User is not authenticated.' };
    }
    const card = cards[cardId];
    
    if (!card) {
      return { success: false, error: 'Card not found.' };
    }

    // Role-based Authorization Guardrails for Columns
    // Only PI or Postdoc can move cards into or out of "approved"
    const isPiOrPostdoc = currentUser.role === 'PI' || currentUser.role === 'POSTDOC';
    
    // Check if transitioning INTO or OUT OF approval gate columns
    const destCol = columns.find((c) => c.id === destColId);
    const srcCol = columns.find((c) => c.id === sourceColId);
    
    if (destCol?.isApprovalGate || srcCol?.isApprovalGate) {
      // Trying to move card into approved column
      if (destColId === 'approved' && !isPiOrPostdoc) {
        // Prevent student from approving their own card
        return {
          success: false,
          error: 'Only the PI or a Postdoc can approve tasks and move cards to the Approved column.'
        };
      }
      
      // Moving card OUT of review or approved columns
      if ((sourceColId === 'approved' || sourceColId === 'review') && !isPiOrPostdoc) {
        return {
          success: false,
          error: `Only the PI or a Postdoc can move cards out of the ${sourceColId === 'approved' ? 'Approved' : 'Review'} column.`
        };
      }
    }

    // Authorization checks for moving OTHER users' cards:
    // Students can only move cards assigned to them.
    if (!isPiOrPostdoc && card.assigneeId !== currentUser.id) {
      return {
        success: false,
        error: 'You do not have permission to move cards assigned to other lab members.'
      };
    }

    // Process the movement
    const sourceCol = columns.find((c) => c.id === sourceColId);
    const destinationCol = columns.find((c) => c.id === destColId);
    
    if (!sourceCol || !destinationCol) {
      return { success: false, error: 'Columns not found.' };
    }

    const newSourceCardIds = Array.from(sourceCol.cardIds);
    newSourceCardIds.splice(sourceIndex, 1);
    
    const newDestCardIds = Array.from(destinationCol.cardIds);
    // If same column, splice on newSourceCardIds
    if (sourceColId === destColId) {
      const ids = Array.from(sourceCol.cardIds);
      ids.splice(sourceIndex, 1);
      ids.splice(destIndex, 0, cardId);
      
      const newColumns = columns.map((col) =>
        col.id === sourceColId ? { ...col, cardIds: ids } : col
      );
      
      set({ columns: newColumns });
      return { success: true };
    }

    newDestCardIds.splice(destIndex, 0, cardId);

    const newColumns = columns.map((col) => {
      if (col.id === sourceColId) {
        return { ...col, cardIds: newSourceCardIds };
      }
      if (col.id === destColId) {
        return { ...col, cardIds: newDestCardIds };
      }
      return col;
    });

    // Update card columnId
    const updatedCard = {
      ...card,
      columnId: destColId,
      updatedAt: new Date().toISOString()
    };

    // If moved to review, request approval automatically
    if (destColId === 'review') {
      updatedCard.approvalRequested = true;
    }

    // If moved back to active work or backlog from review, reset approval requested
    if (sourceColId === 'review' && destColId !== 'approved') {
      updatedCard.approvalRequested = false;
    }

    const updatedCards = {
      ...cards,
      [cardId]: updatedCard
    };

    set({
      columns: newColumns,
      cards: updatedCards
    });

    // Recalculate velocities after movement
    get().recalculateVelocities();

    return { success: true };
  },

  updateCard: (cardId, updatedFields) => {
    const { cards } = get();
    const card = cards[cardId];
    if (!card) return;

    const updatedCard = {
      ...card,
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };

    set({
      cards: {
        ...cards,
        [cardId]: updatedCard
      }
    });

    get().recalculateVelocities();
  },

  approveCard: (cardId) => {
    const { currentUser, cards, columns } = get();
    if (!currentUser) return;
    const card = cards[cardId];
    if (!card) return;

    // Only PI or Postdoc can approve
    if (currentUser.role !== 'PI' && currentUser.role !== 'POSTDOC') {
      return;
    }

    const updatedCard: KanbanCard = {
      ...card,
      isApproved: true,
      approvalRequested: false,
      approvedById: currentUser.id,
      columnId: 'approved',
      updatedAt: new Date().toISOString()
    };

    // Move card in column cardIds if it is in another column
    let newColumns = [...columns];
    if (card.columnId !== 'approved') {
      newColumns = columns.map((col) => {
        if (col.id === card.columnId) {
          return { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) };
        }
        if (col.id === 'approved') {
          return { ...col, cardIds: [...col.cardIds, cardId] };
        }
        return col;
      });
    }

    set({
      cards: {
        ...cards,
        [cardId]: updatedCard
      },
      columns: newColumns
    });

    // Recalculate velocities after approval
    get().recalculateVelocities();
  },

  addComment: (cardId, content) => {
    const { currentUser, cards } = get();
    if (!currentUser) return;
    const card = cards[cardId];
    if (!card) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      content,
      createdAt: new Date().toISOString()
    };

    const updatedCard = {
      ...card,
      comments: [...card.comments, newComment],
      updatedAt: new Date().toISOString()
    };

    set({
      cards: {
        ...cards,
        [cardId]: updatedCard
      }
    });
  },

  addCard: (title, summary, priority, category, assigneeId, columnId = 'inbox') => {
    const { cards, columns } = get();
    const newId = `card-${Date.now()}`;
    const newCard = {
      id: newId,
      title,
      summary,
      columnId,
      assigneeId,
      category,
      priority,
      artifactLinks: {},
      academicMetadata: {},
      isApproved: columnId === 'approved',
      approvalRequested: columnId === 'review',
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newColumns = columns.map((col) => {
      if (col.id === columnId) {
        return { ...col, cardIds: [...col.cardIds, newId] };
      }
      return col;
    });

    set({
      cards: {
        ...cards,
        [newId]: newCard
      },
      columns: newColumns
    });

    get().recalculateVelocities();
  },

  deleteCard: (cardId) => {
    const { cards, columns } = get();
    const newCards = { ...cards };
    delete newCards[cardId];

    const newColumns = columns.map((col) => ({
      ...col,
      cardIds: col.cardIds.filter((id) => id !== cardId)
    }));

    set({
      cards: newCards,
      columns: newColumns
    });

    get().recalculateVelocities();
  },

  updateMilestoneStatus: (studentId, milestoneId, status) => {
    const { studentTracks } = get();
    const track = studentTracks[studentId];
    if (!track) return;

    const updatedMilestones = track.milestones.map((m) =>
      m.id === milestoneId ? { ...m, status } : m
    );

    const updatedTrack = {
      ...track,
      milestones: updatedMilestones
    };

    set({
      studentTracks: {
        ...studentTracks,
        [studentId]: updatedTrack
      }
    });

    get().recalculateVelocities();
  },

  addMilestone: (studentId, title, targetDate) => {
    const { studentTracks } = get();
    const track = studentTracks[studentId];
    if (!track) return;

    const newMilestone = {
      id: `m-${Date.now()}`,
      title,
      targetDate,
      status: 'NOT_STARTED' as const,
      linkedCardIds: []
    };

    const updatedMilestones = [...track.milestones, newMilestone];
    updatedMilestones.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

    const updatedTrack = {
      ...track,
      milestones: updatedMilestones
    };

    set({
      studentTracks: {
        ...studentTracks,
        [studentId]: updatedTrack
      }
    });

    get().recalculateVelocities();
  },

  deleteMilestone: (studentId, milestoneId) => {
    const { studentTracks } = get();
    const track = studentTracks[studentId];
    if (!track) return;

    const updatedMilestones = track.milestones.filter(m => m.id !== milestoneId);

    const updatedTrack = {
      ...track,
      milestones: updatedMilestones
    };

    set({
      studentTracks: {
        ...studentTracks,
        [studentId]: updatedTrack
      }
    });

    get().recalculateVelocities();
  },

  updateMilestone: (studentId, milestoneId, title, targetDate) => {
    const { studentTracks } = get();
    const track = studentTracks[studentId];
    if (!track) return;

    const updatedMilestones = track.milestones.map((m) =>
      m.id === milestoneId ? { ...m, title, targetDate } : m
    );
    updatedMilestones.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

    const updatedTrack = {
      ...track,
      milestones: updatedMilestones
    };

    set({
      studentTracks: {
        ...studentTracks,
        [studentId]: updatedTrack
      }
    });

    get().recalculateVelocities();
  },

  addResearchActivity: (activity) => {
    const { researchActivities } = get();
    set({
      researchActivities: [...researchActivities, activity]
    });
  },

  updateResearchActivity: (activityId, date, startTime, endTime) => {
    const { researchActivities, cards } = get();
    const updated = researchActivities.map((act) => {
      if (act.id === activityId) {
        const updatedAct = { ...act, date, startTime, endTime };
        
        // If this activity is linked to a card, update the card's due date automatically!
        if (act.linkedCardId && cards[act.linkedCardId]) {
          setTimeout(() => {
            get().updateCard(act.linkedCardId!, { dueDate: date });
          }, 0);
        }
        
        return updatedAct;
      }
      return act;
    });

    set({ researchActivities: updated });
  },

  deleteResearchActivity: (activityId) => {
    const { researchActivities } = get();
    set({
      researchActivities: researchActivities.filter((act) => act.id !== activityId)
    });
  },

  recalculateVelocities: () => {
    const { studentTracks, cards } = get();
    const updatedTracks = { ...studentTracks };
    
    // Current date is mock current date: 2026-05-24
    const currentDate = new Date('2026-05-24');

    Object.keys(updatedTracks).forEach((studentId) => {
      const track = updatedTracks[studentId];
      
      // Calculate velocities
      // 1. Find the next active/incomplete milestone
      const incompleteMilestone = track.milestones.find(
        (m) => m.status !== 'APPROVED'
      );
      
      if (!incompleteMilestone) {
        track.overallStatus = 'ON_TRACK';
        track.requiredVelocity = 0;
        track.actualVelocity = 0;
        return;
      }

      // 2. Count incomplete cards linked to this milestone or generic student cards
      const targetDate = new Date(incompleteMilestone.targetDate);
      const diffTime = targetDate.getTime() - currentDate.getTime();
      const diffWeeks = Math.max(0.1, diffTime / (1000 * 60 * 60 * 24 * 7)); // Avoid division by zero
      
      // Count total incomplete cards for student
      const studentCards = Object.values(cards).filter(
        (c) => c.assigneeId === studentId && c.columnId !== 'approved'
      );
      const remainingIncompleteCards = studentCards.length;

      // Required Velocity = Incomplete cards / Weeks remaining
      const requiredVelocity = parseFloat((remainingIncompleteCards / diffWeeks).toFixed(2));
      
      // 3. Actual Velocity = Cards moved to 'approved' in trailing 14 days / 2
      const approvedCards = Object.values(cards).filter((c) => {
        if (c.assigneeId !== studentId || c.columnId !== 'approved') return false;
        // Check if updated in last 14 days
        const updateDate = new Date(c.updatedAt);
        const daysDiff = (currentDate.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 14;
      });
      const actualVelocity = parseFloat((approvedCards.length / 2).toFixed(2));

      track.requiredVelocity = requiredVelocity;
      track.actualVelocity = actualVelocity;

      // System Risk Status Classification
      // ON_TRACK: Actual_Velocity >= Required_Velocity
      // AT_RISK: Actual_Velocity < Required_Velocity (Weeks remaining between 4 and 8)
      // CRITICAL_STAGNATION: 14 days of zero card movement OR less than 4 weeks remaining while under-velocity
      
      const weeksRemaining = diffWeeks;
      const isUnderVelocity = actualVelocity < requiredVelocity;

      // Check for zero card movement over 14 days
      // Let's check the newest updatedAt of any student card. If oldest than 14 days:
      const studentCardUpdates = Object.values(cards)
        .filter((c) => c.assigneeId === studentId)
        .map((c) => new Date(c.updatedAt).getTime());
      
      const lastMovementTime = studentCardUpdates.length > 0 ? Math.max(...studentCardUpdates) : 0;
      const daysSinceMovement = lastMovementTime > 0 
        ? (currentDate.getTime() - lastMovementTime) / (1000 * 60 * 60 * 24)
        : 15; // default to >14 if no cards

      if (daysSinceMovement >= 14 || (weeksRemaining < 4 && isUnderVelocity)) {
        track.overallStatus = 'CRITICAL_STAGNATION';
      } else if (weeksRemaining <= 8 && isUnderVelocity) {
        track.overallStatus = 'AT_RISK';
      } else {
        track.overallStatus = 'ON_TRACK';
      }
    });

    set({ studentTracks: updatedTracks });
  },

  loadPersonalTasks: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aerosolid-personal-tasks');
      if (saved) {
        try {
          set({ personalTasks: JSON.parse(saved) });
        } catch (e) {
          console.error('Failed to parse personal tasks', e);
        }
      }
    }
  },

  addPersonalTask: (title, dueDate, notes) => {
    const { currentUser, personalTasks } = get();
    if (!currentUser) return;
    const newTask = {
      id: `pt-${Date.now()}`,
      userId: currentUser.id,
      title,
      completed: false,
      dueDate: dueDate || undefined,
      notes: notes || undefined
    };
    const updated = [newTask, ...personalTasks];
    set({ personalTasks: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('aerosolid-personal-tasks', JSON.stringify(updated));
    }
  },

  togglePersonalTask: (taskId) => {
    const { personalTasks } = get();
    const updated = personalTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    set({ personalTasks: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('aerosolid-personal-tasks', JSON.stringify(updated));
    }
  },

  deletePersonalTask: (taskId) => {
    const { personalTasks } = get();
    const updated = personalTasks.filter(t => t.id !== taskId);
    set({ personalTasks: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('aerosolid-personal-tasks', JSON.stringify(updated));
    }
  },

  updatePersonalTask: (taskId, title, dueDate, notes) => {
    const { personalTasks } = get();
    const updated = personalTasks.map(t => t.id === taskId ? { ...t, title, dueDate: dueDate || undefined, notes: notes || undefined } : t);
    set({ personalTasks: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('aerosolid-personal-tasks', JSON.stringify(updated));
    }
  }
}));
