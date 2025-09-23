import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Task, Member, FilterState, ID, TaskStatus, Attachment, VoiceNote, BoardConfig } from '../types';
// FIX: Added dbGetBlob to the import list to resolve undefined errors.
import { dbGetTasks, dbPutTask, dbGetMembers, dbPutMember, dbDeleteTask, dbDeleteMember, dbPutBlob, dbGetBlob, dbDeleteBlob, dbGetConfig, dbPutConfig, dbClearTasks, dbClearMembers } from '../services/db';
import { TEAM_MEMBERS_SEED, TASKS_SEED, DB_CONFIG, BOARD_CONFIG_ID, DEFAULT_COLUMN_NAMES } from '../constants';
import { useToast } from '../hooks/useToast';

interface KanbanContextType {
  tasks: Task[];
  members: Member[];
  filters: FilterState;
  loading: boolean;
  currentUser: Member | null;
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>, attachments: {file: File, id: string}[], voiceNotes: {blob: Blob, durationMs: number, id: string}[]) => Promise<void>;
  updateTask: (taskData: Task, newAttachments: {file: File, id: string}[], attachmentsToRemove: Attachment[], newVoiceNotes: {blob: Blob, durationMs: number, id: string}[], voiceNotesToRemove: VoiceNote[]) => Promise<void>;
  deleteTask: (taskId: ID) => Promise<void>;
  moveTask: (taskId: ID, newStatus: TaskStatus) => Promise<void>;
  addMember: (memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMember: (member: Member, avatarFile?: File) => Promise<void>;
  deleteMember: (memberId: ID) => Promise<void>;
  setFilters: (filters: FilterState) => void;
  getMemberById: (id: ID) => Member | undefined;
  columnNames: Record<TaskStatus, string>;
  updateColumnNames: (newNames: Record<TaskStatus, string>) => Promise<void>;
  clearAllTasks: () => Promise<void>;
  resetBoard: () => Promise<void>;
}

export const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({ searchTerm: '', assigneeIds: [], dueDate: null });
  const [columnNames, setColumnNames] = useState<Record<TaskStatus, string>>(DEFAULT_COLUMN_NAMES);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const { showToast } = useToast();

  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      
      let config = await dbGetConfig(BOARD_CONFIG_ID);
      if (!config) {
        config = { id: BOARD_CONFIG_ID, columnNames: DEFAULT_COLUMN_NAMES };
        await dbPutConfig(config);
      }
      setColumnNames(config.columnNames);

      let currentMembers = await dbGetMembers();
      if (currentMembers.length === 0) {
        const now = new Date().toISOString();
        const seededMembers: Member[] = TEAM_MEMBERS_SEED.map(m => ({
          ...m,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        }));
        await Promise.all(seededMembers.map(dbPutMember));
        currentMembers = seededMembers;
      }
      setMembers(currentMembers);

      // Mock authentication: Set the first member as the current user.
      if (currentMembers.length > 0) {
        setCurrentUser(currentMembers[0]);
      }

      let currentTasks = await dbGetTasks();
      if (currentTasks.length === 0 && currentMembers.length > 0) {
        const now = new Date().toISOString();
        const seededTasks: Task[] = TASKS_SEED.map((t, index) => {
            const responsible = currentMembers[index % currentMembers.length];
            const assignees = [responsible, currentMembers[(index + 1) % currentMembers.length]];
            return {
                ...t,
                id: crypto.randomUUID(),
                responsibleId: responsible.id,
                assigneeIds: Array.from(new Set(assignees.map(a => a.id))),
                createdAt: now,
                updatedAt: now,
                updatedBy: responsible.id,
            }
        });
        await Promise.all(seededTasks.map(dbPutTask));
        currentTasks = seededTasks;
      }
      setTasks(currentTasks);
    } catch (error) {
      console.error("Failed to initialize data:", error);
      showToast("Veriler başlatılırken hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const getMemberById = useCallback((id: ID) => members.find(m => m.id === id), [members]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>, attachments: {file: File, id: string}[], voiceNotes: {blob: Blob, durationMs: number, id: string}[]) => {
    if (!currentUser) {
        showToast("Giriş yapmış kullanıcı yok.", "error");
        return;
    }
    const now = new Date().toISOString();
    const newAttachments: Attachment[] = [];
    const newVoiceNotes: VoiceNote[] = [];

    for(const att of attachments) {
        await dbPutBlob(DB_CONFIG.STORES.ATTACHMENTS, att.id, att.file);
        newAttachments.push({
            id: att.id,
            blobKey: att.id,
            fileName: att.file.name,
            mimeType: att.file.type,
            sizeBytes: att.file.size,
            createdAt: now,
        });
    }

    for(const vn of voiceNotes) {
        await dbPutBlob(DB_CONFIG.STORES.VOICE_NOTES, vn.id, vn.blob);
        newVoiceNotes.push({
            id: vn.id,
            blobKey: vn.id,
            durationMs: vn.durationMs,
            createdAt: now,
        });
    }

    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      attachments: newAttachments,
      voiceNotes: newVoiceNotes,
      createdAt: now,
      updatedAt: now,
      updatedBy: currentUser.id,
    };

    await dbPutTask(newTask);
    setTasks(prev => [...prev, newTask]);
    showToast("Görev başarıyla oluşturuldu!", "success");
  };

  const updateTask = async (taskData: Task, newAttachments: {file: File, id: string}[], attachmentsToRemove: Attachment[], newVoiceNotes: {blob: Blob, durationMs: number, id: string}[], voiceNotesToRemove: VoiceNote[]) => {
    if (!currentUser) {
        showToast("Giriş yapmış kullanıcı yok.", "error");
        return;
    }
    const now = new Date().toISOString();
    
    await Promise.all(attachmentsToRemove.map(att => dbDeleteBlob(DB_CONFIG.STORES.ATTACHMENTS, att.blobKey)));
    await Promise.all(voiceNotesToRemove.map(vn => dbDeleteBlob(DB_CONFIG.STORES.VOICE_NOTES, vn.blobKey)));
    
    const addedAttachments: Attachment[] = [];
    for(const att of newAttachments) {
        await dbPutBlob(DB_CONFIG.STORES.ATTACHMENTS, att.id, att.file);
        addedAttachments.push({
            id: att.id,
            blobKey: att.id,
            fileName: att.file.name,
            mimeType: att.file.type,
            sizeBytes: att.file.size,
            createdAt: now,
        });
    }
    
    const addedVoiceNotes: VoiceNote[] = [];
    for(const vn of newVoiceNotes) {
        await dbPutBlob(DB_CONFIG.STORES.VOICE_NOTES, vn.id, vn.blob);
        addedVoiceNotes.push({
            id: vn.id,
            blobKey: vn.id,
            durationMs: vn.durationMs,
            createdAt: now,
        });
    }
    
    const updatedTask = {
      ...taskData,
      attachments: [...taskData.attachments.filter(att => !attachmentsToRemove.find(r => r.id === att.id)), ...addedAttachments],
      voiceNotes: [...taskData.voiceNotes.filter(vn => !voiceNotesToRemove.find(r => r.id === vn.id)), ...addedVoiceNotes],
      updatedAt: now,
      updatedBy: currentUser.id,
    };
    
    await dbPutTask(updatedTask);
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    showToast("Görev başarıyla güncellendi!", "success");
  };

  const deleteTask = async (taskId: ID) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    await Promise.all(taskToDelete.attachments.map(att => dbDeleteBlob(DB_CONFIG.STORES.ATTACHMENTS, att.blobKey)));
    await Promise.all(taskToDelete.voiceNotes.map(vn => dbDeleteBlob(DB_CONFIG.STORES.VOICE_NOTES, vn.blobKey)));

    await dbDeleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast("Görev silindi.", "info");
  };

  const moveTask = async (taskId: ID, newStatus: TaskStatus) => {
    if (!currentUser) return;
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      const updatedTask = { 
        ...task, 
        status: newStatus, 
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.id,
      };
      await dbPutTask(updatedTask);
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    }
  };
  
  const addMember = async (memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newMember: Member = {
      ...memberData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    await dbPutMember(newMember);
    setMembers(prev => [...prev, newMember]);
    showToast("Takım üyesi eklendi!", "success");
  };

  const updateMember = async (member: Member, avatarFile?: File) => {
    const updatedMember = { ...member, updatedAt: new Date().toISOString() };

    if (avatarFile) {
        if (updatedMember.avatarBlobKey) {
            await dbDeleteBlob(DB_CONFIG.STORES.AVATARS, updatedMember.avatarBlobKey);
        }
        const newBlobKey = crypto.randomUUID();
        await dbPutBlob(DB_CONFIG.STORES.AVATARS, newBlobKey, avatarFile);
        updatedMember.avatarBlobKey = newBlobKey;
        if (updatedMember.avatarUrl) {
            delete updatedMember.avatarUrl;
        }
    }

    await dbPutMember(updatedMember);
    setMembers(prev => prev.map(m => m.id === member.id ? updatedMember : m));
    showToast("Takım üyesi güncellendi.", "success");
  };

  const deleteMember = async (memberId: ID) => {
    if (tasks.some(task => task.responsibleId === memberId)) {
        showToast("Üye, bazı görevlerden sorumlu olduğu için silinemez. Lütfen önce görevleri yeniden atayın.", "error");
        return;
    }

    const tasksToUpdate = tasks
        .filter(task => task.assigneeIds.includes(memberId))
        .map(task => ({
            ...task,
            assigneeIds: task.assigneeIds.filter(id => id !== memberId),
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.id,
        }));
    
    await Promise.all(tasksToUpdate.map(dbPutTask));
    
    const memberToDelete = members.find(m => m.id === memberId);
    if (memberToDelete?.avatarBlobKey) {
        await dbDeleteBlob(DB_CONFIG.STORES.AVATARS, memberToDelete.avatarBlobKey);
    }
    
    await dbDeleteMember(memberId);
    
    const updatedTasksMap = new Map(tasksToUpdate.map(task => [task.id, task]));
    setTasks(prev => prev.map(task => updatedTasksMap.get(task.id) || task));
    setMembers(prev => prev.filter(m => m.id !== memberId));
    
    showToast("Takım üyesi kaldırıldı.", "info");
  };

  const updateColumnNames = async (newNames: Record<TaskStatus, string>) => {
    const config = await dbGetConfig(BOARD_CONFIG_ID);
    if (!config) return;
    const newConfig: BoardConfig = { ...config, columnNames: newNames };
    await dbPutConfig(newConfig);
    setColumnNames(newNames);
    showToast("Pano sütunları güncellendi!", "success");
  };

  const clearAllTasks = async () => {
    await dbClearTasks();
    setTasks([]);
    showToast("Tüm görevler temizlendi.", "info");
  };
  
  const resetBoard = async () => {
      await dbClearTasks();
      await dbClearMembers();
      setTasks([]);
      setMembers([]);
      setCurrentUser(null);
      await initializeData();
      showToast("Pano varsayılana sıfırlandı.", "success");
  };

  return (
    <KanbanContext.Provider value={{
      tasks,
      members,
      filters,
      loading,
      currentUser,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      addMember,
      updateMember,
      deleteMember,
      setFilters,
      getMemberById,
      columnNames,
      updateColumnNames,
      clearAllTasks,
      resetBoard,
    }}>
      {children}
    </KanbanContext.Provider>
  );
};