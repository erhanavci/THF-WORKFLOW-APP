import React, { useState, useEffect } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import { Task, Member, ID, TaskStatus, Attachment, VoiceNote, AllTaskStatuses, TaskPriority, AllTaskPriorities, MemberRole, Note } from '../types';
import { useToast } from '../hooks/useToast';
import Modal from './ui/Modal';
import MemberPicker from './MemberPicker';
import FileList from './FileList';
import VoiceRecorder from './VoiceRecorder';
import { formatDateTime } from '../utils/helpers';
import Avatar from './Avatar';

interface TaskModalProps {
  task?: Task;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose }) => {
  const { addTask, updateTask, members, columnNames, currentUser, getMemberById } = useKanbanStore();
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

  const [notes, setNotes] = useState<Note[]>(task?.notes || []);
  const [newNoteContent, setNewNoteContent] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // If the responsible person is un-assigned, clear the responsible field
    if (responsibleId && !assigneeIds.includes(responsibleId)) {
      setResponsibleId(undefined);
    }
  }, [assigneeIds, responsibleId]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Başlık gerekli.';
    if (!responsibleId) newErrors.responsibleId = 'Bir sorumlu seçilmelidir.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim() || !currentUser) return;
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: newNoteContent.trim(),
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [...prev, newNote]);
    setNewNoteContent('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Lütfen kaydetmeden önce hataları düzeltin.', 'error');
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
      notes,
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
      showToast('Görev kaydedilemedi.', 'error');
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
  
  const inputStyles = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-gray-800 read-only:bg-gray-100 dark:read-only:bg-gray-800/50";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-gray-300";
  const isUserAdmin = currentUser?.role === MemberRole.ADMIN;

  return (
    <Modal isOpen onClose={onClose} title={task ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'} className="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <label htmlFor="title" className={labelStyles}>Başlık</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyles} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label htmlFor="description" className={labelStyles}>Açıklama</label>
              <textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows={4} 
                className={inputStyles}
                readOnly={!isUserAdmin}
                aria-readonly={!isUserAdmin}
              ></textarea>
              {!isUserAdmin && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Açıklamayı sadece Yöneticiler düzenleyebilir.</p>}
            </div>
            
            <div className="space-y-4">
                <h3 className={labelStyles}>Notlar</h3>
                <div className="space-y-4 max-h-48 overflow-y-auto pr-2 border-b border-gray-200 dark:border-gray-700 pb-4">
                    {notes.length > 0 ? notes.map(note => {
                        const author = getMemberById(note.authorId);
                        return (
                            <div key={note.id} className="flex items-start gap-3">
                                {author ? <Avatar member={author} size="md" /> : <div className="w-8 h-8 rounded-full bg-gray-300"></div>}
                                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-sm">{author?.name || 'Bilinmeyen Kullanıcı'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(note.createdAt)}</p>
                                    </div>
                                    <p className="text-sm mt-1 whitespace-pre-wrap">{note.content}</p>
                                </div>
                            </div>
                        )
                    }) : <p className="text-sm text-gray-500 dark:text-gray-400">Henüz not yok.</p>}
                </div>
                 <div>
                    <textarea 
                        value={newNoteContent} 
                        onChange={(e) => setNewNoteContent(e.target.value)} 
                        placeholder="Yeni bir not ekle..." 
                        rows={3}
                        className={inputStyles}
                    />
                    <div className="flex justify-end mt-2">
                        <button type="button" onClick={handleAddNote} className="px-3 py-1 text-sm font-semibold text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700 disabled:bg-gray-400" disabled={!newNoteContent.trim()}>Not Ekle</button>
                    </div>
                </div>
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
          <div className="space-y-6 bg-white dark:bg-black/20 p-6 rounded-lg -m-6 md:m-0">
            <div>
              <label htmlFor="status" className={labelStyles}>Durum</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={inputStyles}>
                {AllTaskStatuses.map(s => <option key={s} value={s}>{columnNames[s]}</option>)}
              </select>
            </div>
            <div>
                <label htmlFor="priority" className={labelStyles}>Öncelik</label>
                <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className={inputStyles}>
                    {AllTaskPriorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div>
              <label htmlFor="dueDate" className={labelStyles}>Son Tarih</label>
              <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputStyles} />
            </div>
             <div>
              <label className={labelStyles}>Atananlar</label>
              <MemberPicker allMembers={members} selectedIds={assigneeIds} onChange={handleMemberChange} />
            </div>
            <div>
              <label htmlFor="responsible" className={labelStyles}>Sorumlu</label>
              <select id="responsible" value={responsibleId || ''} onChange={handleResponsibleChange} className={inputStyles}>
                <option value="" disabled>Bir kişi seçin</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
              {errors.responsibleId && <p className="text-red-500 text-xs mt-1">{errors.responsibleId}</p>}
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            İptal
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 transition-colors">
            {task ? 'Değişiklikleri Kaydet' : 'Görev Oluştur'}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default TaskModal;