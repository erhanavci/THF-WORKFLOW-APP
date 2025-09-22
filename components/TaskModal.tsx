import React, { useState, useEffect } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import { Task, Member, ID, TaskStatus, Attachment, VoiceNote, AllTaskStatuses, TaskPriority, AllTaskPriorities } from '../types';
import { useToast } from '../hooks/useToast';
import Modal from './ui/Modal';
import MemberPicker from './MemberPicker';
import FileList from './FileList';
import VoiceRecorder from './VoiceRecorder';

interface TaskModalProps {
  task?: Task;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose }) => {
  const { addTask, updateTask, members, columnNames } = useKanbanStore();
  const { showToast } = useToast();

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split('T')[0] : '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || TaskStatus.BACKLOG);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || TaskPriority.MEDIUM);
  const [assigneeIds, setAssigneeIds] = useState<ID[]>(task?.assigneeIds || []);
  const [responsibleId, setResponsibleId] = useState<ID | undefined>(task?.responsibleId);
  
  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>(task?.attachments || []);
  const [newAttachments, setNewAttachments] = useState<{file: File, id: string}[]>([]);
  const [attachmentsToRemove, setAttachmentsToRemove] = useState<Attachment[]>([]);

  const [currentVoiceNotes, setCurrentVoiceNotes] = useState<VoiceNote[]>(task?.voiceNotes || []);
  const [newVoiceNotes, setNewVoiceNotes] = useState<{blob: Blob, durationMs: number, id: string}[]>([]);
  const [voiceNotesToRemove, setVoiceNotesToRemove] = useState<VoiceNote[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // If the responsible person is un-assigned, clear the responsible field
    if (responsibleId && !assigneeIds.includes(responsibleId)) {
      setResponsibleId(undefined);
    }
  }, [assigneeIds, responsibleId]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!responsibleId) newErrors.responsibleId = 'A responsible person must be selected.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors before saving.', 'error');
      return;
    }

    const taskData = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      status,
      priority,
      assigneeIds,
      responsibleId: responsibleId!,
      attachments: currentAttachments,
      voiceNotes: currentVoiceNotes,
    };

    try {
      if (task) {
        await updateTask({ ...task, ...taskData }, newAttachments, attachmentsToRemove, newVoiceNotes, voiceNotesToRemove);
      } else {
        await addTask(taskData, newAttachments, newVoiceNotes);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      showToast('Failed to save task.', 'error');
    }
  };

  const handleMemberChange = (selectedIds: ID[]) => {
    setAssigneeIds(selectedIds);
  };
  
  const handleResponsibleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setResponsibleId(selectedId);
    // Auto-add responsible person to assignees if not already there
    if (selectedId && !assigneeIds.includes(selectedId)) {
        setAssigneeIds(prev => [...prev, selectedId]);
    }
  }
  
  const inputStyles = "mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700/50";
  const labelStyles = "block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <Modal isOpen onClose={onClose} title={task ? 'Edit Task' : 'Create New Task'} className="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <label htmlFor="title" className={labelStyles}>Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyles} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label htmlFor="description" className={labelStyles}>Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputStyles}></textarea>
            </div>
            
            <FileList
              currentAttachments={currentAttachments}
              newAttachments={newAttachments}
              onNewAttachmentsChange={setNewAttachments}
              onCurrentAttachmentsChange={setCurrentAttachments}
              onAttachmentsToRemoveChange={setAttachmentsToRemove}
            />

            <VoiceRecorder
                currentVoiceNotes={currentVoiceNotes}
                newVoiceNotes={newVoiceNotes}
                onNewVoiceNotesChange={setNewVoiceNotes}
                onCurrentVoiceNotesChange={setCurrentVoiceNotes}
                onVoiceNotesToRemoveChange={setVoiceNotesToRemove}
            />

          </div>

          {/* Sidebar */}
          <div className="space-y-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg -m-6 md:m-0">
            <div>
              <label htmlFor="status" className={labelStyles}>Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={inputStyles}>
                {AllTaskStatuses.map(s => <option key={s} value={s}>{columnNames[s]}</option>)}
              </select>
            </div>
            <div>
                <label htmlFor="priority" className={labelStyles}>Priority</label>
                <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className={inputStyles}>
                    {AllTaskPriorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div>
              <label htmlFor="dueDate" className={labelStyles}>Due Date</label>
              <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputStyles} />
            </div>
             <div>
              <label className={labelStyles}>Assignees</label>
              <MemberPicker allMembers={members} selectedIds={assigneeIds} onChange={handleMemberChange} />
            </div>
            <div>
              <label htmlFor="responsible" className={labelStyles}>Responsible</label>
              <select id="responsible" value={responsibleId || ''} onChange={handleResponsibleChange} className={inputStyles}>
                <option value="" disabled>Select a person</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
              {errors.responsibleId && <p className="text-red-500 text-xs mt-1">{errors.responsibleId}</p>}
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 transition-colors">
            {task ? 'Save Changes' : 'Create Task'}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default TaskModal;