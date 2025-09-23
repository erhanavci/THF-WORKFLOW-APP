import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Task, Member, TaskStatus, TaskPriority } from '../types';
import { useKanbanStore } from '../hooks/useKanbanStore';
import { formatDate, isOverdue, formatDateTime } from '../utils/helpers';
import TaskModal from './TaskModal';
import Avatar from './Avatar';
import { PriorityHighIcon, PriorityMediumIcon, PriorityLowIcon } from './icons/Icons';


interface TaskCardProps {
    task: Task;
}

const AttachmentIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
);

const MicIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
);

const PriorityIcon: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
    const priorityStyles = {
        [TaskPriority.HIGH]: { icon: PriorityHighIcon, color: 'text-red-500' },
        [TaskPriority.MEDIUM]: { icon: PriorityMediumIcon, color: 'text-amber-500' },
        [TaskPriority.LOW]: { icon: PriorityLowIcon, color: 'text-emerald-500' },
    };
    const style = priorityStyles[priority];
    if (!style) return null;
    const IconComponent = style.icon;

    return (
        <div className="relative group flex items-center">
            <IconComponent className={`w-4 h-4 ${style.color}`} />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {priority} Öncelik
            </div>
        </div>
    );
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const { getMemberById } = useKanbanStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const assignees = task.assigneeIds.map(getMemberById).filter(Boolean) as Member[];
    const responsibleMember = getMemberById(task.responsibleId);
    const lastEditor = task.updatedBy ? getMemberById(task.updatedBy) : null;
    const overdue = task.status !== TaskStatus.DONE && isOverdue(task.dueDate);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TASK',
        item: { id: task.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [task.id]);


    return (
        <>
            <div
                ref={drag as any}
                onClick={() => setIsModalOpen(true)}
                className={`bg-white dark:bg-gray-900 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 ring-1 ring-gray-200 dark:ring-gray-800 flex flex-col justify-between ${isDragging ? 'opacity-50 ring-2 ring-sky-500 shadow-2xl scale-105' : 'shadow-sm'}`}
                role="button"
                aria-label={`Görevi düzenle: ${task.title}`}
            >
                <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{task.title}</h4>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-3">
                            <PriorityIcon priority={task.priority} />
                            {task.attachments.length > 0 && <span className="flex items-center gap-1"><AttachmentIcon /> {task.attachments.length}</span>}
                            {task.voiceNotes.length > 0 && <span className="flex items-center gap-1"><MicIcon /> {task.voiceNotes.length}</span>}
                        </div>
                         {task.dueDate && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${overdue ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-800'}`}>
                                {formatDate(task.dueDate)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex -space-x-2">
                            {assignees.map(member => <Avatar key={member.id} member={member} />)}
                        </div>
                        {responsibleMember && (
                             <div className="relative group">
                                <Avatar member={responsibleMember} size="md" responsible />
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    Sorumlu: {responsibleMember.name}
                                </div>
                            </div>
                        )}
                    </div>
                     {lastEditor && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-right truncate">
                            Düzenleyen: {lastEditor.name}
                        </p>
                    )}
                </div>
            </div>
            {isModalOpen && <TaskModal task={task} onClose={() => setIsModalOpen(false)} />}
        </>
    );
};

export default TaskCard;