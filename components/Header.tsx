import React, { useState } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import TaskModal from './TaskModal';
import { MemberRole } from '../types';
import DarkModeSwitch from './DarkModeSwitch';
import FilterDropdown from './FilterDropdown';
import { SettingsIcon } from './icons/Icons';
import { logoLight, logoDark } from '../assets/logo';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
    onAdminPanelClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminPanelClick }) => {
    const { currentUser } = useKanbanStore();
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const { isDarkMode } = useTheme();

    return (
        <>
            <header className="bg-white/70 dark:bg-gray-950/70 backdrop-blur-lg shadow-sm p-4 flex items-center justify-between gap-4 sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center">
                    <img 
                        src={isDarkMode ? logoDark : logoLight} 
                        alt="THF WORKFLOW APP Logo" 
                        className="h-8 sm:h-10" 
                    />
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4">
                    <FilterDropdown />

                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 transition-colors duration-200"
                    >
                        +<span className="hidden sm:inline ml-1">New Task</span>
                    </button>

                    {currentUser?.role === MemberRole.ADMIN && (
                        <button 
                            onClick={onAdminPanelClick}
                            className="p-2 text-gray-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Open Admin Panel"
                        >
                            <SettingsIcon className="w-6 h-6" />
                        </button>
                    )}

                    <DarkModeSwitch />
                </div>
            </header>
            {isTaskModalOpen && <TaskModal onClose={() => setIsTaskModalOpen(false)} />}
        </>
    );
};

export default Header;