import { Member, Task, TaskStatus, MemberRole, TaskPriority } from './types';

export const TEAM_MEMBERS_SEED: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Alice Johnson', email: 'alice.j@example.com', role: MemberRole.ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { name: 'Bob Williams', email: 'bob.w@example.com', role: MemberRole.MEMBER, avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
  { name: 'Charlie Brown', email: 'charlie.b@example.com', role: MemberRole.MEMBER, avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
  { name: 'Diana Miller', email: 'diana.m@example.com', role: MemberRole.MEMBER, avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
  { name: 'Ethan Davis', email: 'ethan.d@example.com', role: MemberRole.MEMBER, avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026708d' },
  { name: 'Fiona Garcia', email: 'fiona.g@example.com', role: MemberRole.MEMBER, avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026709d' },
];

export const TASKS_SEED: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'responsibleId' | 'assigneeIds'>[] = [
    {
        title: 'Design new landing page',
        description: 'Create a modern and responsive design for the main landing page.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: [],
        voiceNotes: [],
    },
    {
        title: 'Develop user authentication API',
        description: 'Implement JWT-based authentication endpoints for login, registration, and logout.',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: [],
        voiceNotes: [],
    },
    {
        title: 'Implement drag-and-drop feature',
        description: 'Enable drag-and-drop functionality for task cards on the Kanban board.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: [],
        voiceNotes: [],
    },
    {
        title: 'Fix mobile layout bugs',
        description: 'Resolve CSS issues on smaller screen sizes, especially on the dashboard.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
        attachments: [],
        voiceNotes: [],
    },
    {
        title: 'Deploy staging environment',
        description: 'Set up the CI/CD pipeline for automatic deployments to the staging server.',
        status: TaskStatus.DONE,
        priority: TaskPriority.LOW,
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: [],
        voiceNotes: [],
    },
];

export const DB_CONFIG = {
  DB_NAME: 'KanbanFlowDB',
  DB_VERSION: 1,
  STORES: {
    TASKS: 'tasks',
    MEMBERS: 'members',
    ATTACHMENTS: 'attachments',
    VOICE_NOTES: 'voice_notes',
    CONFIG: 'config',
  },
};

export const BOARD_CONFIG_ID = 'main_board_config';

export const DEFAULT_COLUMN_NAMES: Record<TaskStatus, string> = {
    [TaskStatus.BACKLOG]: 'Backlog',
    [TaskStatus.TODO]: 'To Do',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.DONE]: 'Done',
};