import React, { useMemo } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import { AllTaskStatuses, TaskStatus } from '../types';
import Column from './Column';
import { isOverdue, isThisWeek } from '../utils/helpers';

const Board: React.FC = () => {
    const { tasks, filters, loading } = useKanbanStore();

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const searchTermMatch = task.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                task.description?.toLowerCase().includes(filters.searchTerm.toLowerCase());
            
            const responsibleMatch = !filters.responsibleId || task.responsibleId === filters.responsibleId;
            
            const assigneeMatch = filters.assigneeIds.length === 0 || task.assigneeIds.some(id => filters.assigneeIds.includes(id));

            const dueDateMatch = !filters.dueDate ||
                (filters.dueDate === 'overdue' && task.status !== TaskStatus.DONE && isOverdue(task.dueDate)) ||
                (filters.dueDate === 'this_week' && isThisWeek(task.dueDate));

            return searchTermMatch && responsibleMatch && assigneeMatch && dueDateMatch;
        });
    }, [tasks, filters]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><p>Pano yükleniyor...</p></div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-full">
            {AllTaskStatuses.map(status => (
                <Column
                    key={status}
                    status={status}
                    tasks={filteredTasks.filter(task => task.status === status)}
                />
            ))}
        </div>
    );
};

export default Board;