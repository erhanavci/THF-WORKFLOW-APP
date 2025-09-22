import React, { useState } from 'react';
import { KanbanProvider } from './context/KanbanContext';
import Board from './components/Board';
import Header from './components/Header';
import { Toaster } from './components/ui/Toaster';
import AdminPanelModal from './components/AdminPanelModal';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  return (
    <ThemeProvider>
      <DndProvider backend={HTML5Backend}>
        <KanbanProvider>
          <div className="min-h-screen bg-white dark:bg-black text-black dark:text-gray-200 flex flex-col transition-colors duration-300">
            <Header onAdminPanelClick={() => setIsAdminPanelOpen(true)} />
            <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-x-auto">
              <Board />
            </main>
            <Toaster />
            {isAdminPanelOpen && <AdminPanelModal onClose={() => setIsAdminPanelOpen(false)} />}
          </div>
        </KanbanProvider>
      </DndProvider>
    </ThemeProvider>
  );
};

export default App;