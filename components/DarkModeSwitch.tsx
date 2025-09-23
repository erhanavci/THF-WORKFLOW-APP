import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from './icons/Icons';

const DarkModeSwitch: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const getIcon = () => {
        switch (theme) {
            case 'light': return <SunIcon className="w-5 h-5" />;
            case 'dark': return <MoonIcon className="w-5 h-5" />;
        }
    };
    
    const getLabel = () => `${theme === 'light' ? 'Karanlık' : 'Aydınlık'} moda geç`;

    return (
        <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={getLabel()}
        >
            {getIcon()}
        </button>
    );
};

export default DarkModeSwitch;