import React from 'react';
import { useDrop } from 'react-dnd';
import { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';
import { useKanbanStore } from '../hooks/useKanbanStore';

interface ColumnProps {
    status: TaskStatus;
    tasks: Task[];
}

const Column: React.FC<ColumnProps> = ({ status, tasks }) => {
    const { moveTask, columnNames } = useKanbanStore();

    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: 'TASK',
        drop: (item: { id: string }) => moveTask(item.id, status),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    }), [status, moveTask]);

    const getStatusColor = (s: TaskStatus) => {
        switch(s) {
            case TaskStatus.BACKLOG: return 'bg-slate-400';
            case TaskStatus.TODO: return 'bg-sky-500';
            case TaskStatus.IN_PROGRESS: return 'bg-amber-500';
            case TaskStatus.DONE: return 'bg-emerald-500';
        }
    }

    return (
        <div
            ref={drop}
            className={`flex flex-col rounded-xl h-full transition-colors duration-200 ${isOver && canDrop ? 'bg-sky-100/50 dark:bg-sky-900/20' : ''}`}
        >
            <header className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{columnNames[status]}</h3>
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 rounded-full px-2 py-0.5">{tasks.length}</span>
            </header>
            <div className="flex-grow p-2 space-y-4 overflow-y-auto">
                {tasks.length > 0 ? (
                    tasks.map(task => <TaskCard key={task.id} task={task} />)
                ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-10 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        <p>No tasks yet.</p>
                        <p className="text-sm">Drop a task here to add it.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Column;