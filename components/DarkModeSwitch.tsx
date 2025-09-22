import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon, DesktopIcon } from './icons/Icons';

const DarkModeSwitch: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const cycleTheme = () => {
        const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const getIcon = () => {
        switch (theme) {
            case 'light': return <SunIcon className="w-5 h-5" />;
            case 'dark': return <MoonIcon className="w-5 h-5" />;
            case 'system': return <DesktopIcon className="w-5 h-5" />;
        }
    };
    
    const getLabel = () => `Cycle theme (current: ${theme})`;

    return (
        <button
            onClick={cycleTheme}
            className="p-2 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label={getLabel()}
        >
            {getIcon()}
        </button>
    );
};

export default DarkModeSwitch;