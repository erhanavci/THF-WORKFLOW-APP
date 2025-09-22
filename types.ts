// FIX: The original file had incorrect imports causing type conflicts and undefined types.
// This was fixed by removing the faulty import and export statements, and defining the 'ID' type.
export type ID = string;

export enum MemberRole {
  ADMIN = 'Admin',
  MEMBER = 'Member',
}

export enum TaskStatus {
  BACKLOG = 'Backlog',
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export enum TaskPriority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
}

export const AllTaskStatuses: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE,
];

export const AllTaskPriorities: TaskPriority[] = [
    TaskPriority.LOW,
    TaskPriority.MEDIUM,
    TaskPriority.HIGH,
];


export interface Member {
  id: ID;
  name: string;
  role: MemberRole;
  avatarUrl?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export interface Attachment {
  id: ID;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  blobKey: ID;        // key to retrieve blob from IndexedDB
  createdAt: string;
};

export interface VoiceNote {
  id: ID;
  blobKey: ID;        // key to retrieve audio blob
  durationMs: number;
  createdAt: string;
};

export interface Task {
  id: ID;
  title: string;
  description?: string;
  dueDate?: string;   // ISO
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: ID[];  // must include responsibleId
  responsibleId: ID;  // required
  attachments: Attachment[];
  voiceNotes: VoiceNote[];
  createdAt: string;
  updatedAt: string;
};

export interface FilterState {
  searchTerm: string;
  assigneeIds: ID[];
  responsibleId?: ID;
  dueDate?: 'overdue' | 'this_week' | null;
}

export interface BoardConfig {
  id: string; // Should be a constant value for singleton config
  columnNames: Record<TaskStatus, string>;
}