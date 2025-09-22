import React, { useState, useRef, useEffect } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import { FilterState } from '../types';
import { FilterIcon } from './icons/Icons';

const FilterDropdown: React.FC = () => {
    const { setFilters, filters, members } = useKanbanStore();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFilterChange = (field: keyof FilterState, value: any) => {
        setFilters({ ...filters, [field]: value });
    };

    const handleClearFilters = () => {
        setFilters({
            searchTerm: '',
            assigneeIds: [],
            responsibleId: undefined,
            dueDate: null,
        });
        setIsOpen(false);
    };

    const isFilterActive = filters.searchTerm || filters.assigneeIds.length > 0 || filters.responsibleId || filters.dueDate;

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative px-3 sm:px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <FilterIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                </div>
                {isFilterActive && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-white dark:border-black"></div>}
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-2 w-72 origin-top-right right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg p-4 space-y-4">
                    <h3 className="text-lg font-semibold">Filter Tasks</h3>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    />
                    
                    <select 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={filters.responsibleId || ''}
                        onChange={(e) => handleFilterChange('responsibleId', e.target.value || undefined)}
                    >
                        <option value="">All Responsible</option>
                        {members.map(member => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </select>

                    <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={filters.assigneeIds[0] || ''}
                        onChange={(e) => handleFilterChange('assigneeIds', e.target.value ? [e.target.value] : [])}
                    >
                        <option value="">All Assignees</option>
                        {members.map(member => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </select>

                    <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={filters.dueDate || ''}
                        onChange={(e) => handleFilterChange('dueDate', e.target.value || null)}
                    >
                        <option value="">All Due Dates</option>
                        <option value="overdue">Overdue</option>
                        <option value="this_week">This Week</option>
                    </select>

                    <button
                        onClick={handleClearFilters}
                        className="w-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;