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


    const getStatusStyles = (s: TaskStatus) => {
        switch(s) {
            case TaskStatus.BACKLOG: return {
                bg: 'bg-gray-500 dark:bg-gray-600',
                badgeBg: 'bg-black/20',
            };
            case TaskStatus.TODO: return {
                bg: 'bg-sky-500 dark:bg-sky-600',
                badgeBg: 'bg-black/20',
            };
            case TaskStatus.IN_PROGRESS: return {
                bg: 'bg-amber-500 dark:bg-amber-600',
                badgeBg: 'bg-black/20',
            };
            case TaskStatus.DONE: return {
                bg: 'bg-emerald-500 dark:bg-emerald-600',
                badgeBg: 'bg-black/20',
            };
        }
    }

    const styles = getStatusStyles(status);

    return (
        <div
            ref={drop as any}
            className={`flex flex-col rounded-xl h-full transition-all duration-200 bg-gray-100 dark:bg-gray-800/50 shadow-sm ${isOver && canDrop ? 'ring-2 ring-sky-500' : 'ring-1 ring-gray-200 dark:ring-gray-700/50'}`}
        >
            <header className={`p-4 flex items-center justify-between rounded-t-xl ${styles.bg}`}>
                <h3 className="font-semibold text-lg text-white">{columnNames[status]}</h3>
                <span className={`text-sm font-medium text-white rounded-full px-2.5 py-0.5 ${styles.badgeBg}`}>{tasks.length}</span>
            </header>
            <div className="flex-grow p-2 space-y-4 overflow-y-auto">
                {tasks.length > 0 ? (
                    tasks.map(task => <TaskCard key={task.id} task={task} />)
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg m-2">
                        <p>Henüz görev yok.</p>
                        <p className="text-sm">Eklemek için bir görevi buraya sürükleyin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Column;