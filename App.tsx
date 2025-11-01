import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import PortfolioGenerator from './components/PortfolioGenerator';
import { Bot, Moon, Sun, Sparkles, Wallet } from './components/Icons';

type Tab = 'chat' | 'portfolio';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const TabButton: React.FC<{ tabName: Tab; icon: React.ReactNode; label: string }> = ({ tabName, icon, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex-1 sm:flex-none sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabName
          ? 'bg-emerald-600 text-white shadow'
          : 'dark:text-gray-300 text-gray-600 dark:hover:bg-gray-700/50 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
  
  const ThemeToggleButton: React.FC<{className?: string}> = ({ className }) => (
     <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`text-left px-3 py-2 rounded-lg flex items-center justify-center sm:justify-start gap-2 dark:bg-gray-700/60 dark:hover:bg-gray-700/40 bg-gray-200 hover:bg-gray-300 transition-colors ${className}`}>
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} 
        <span className="text-sm hidden sm:inline">Toggle Theme</span>
      </button>
  );

  return (
    <div className={`min-h-screen flex flex-col sm:flex-row font-sans dark:bg-gray-900 bg-gray-100`}>
      {/* Sidebar / Main Navigation */}
      <aside className={`w-full sm:w-64 p-3 sm:p-5 border-b sm:border-b-0 sm:border-r dark:border-gray-700 border-gray-200 dark:text-white text-gray-800 bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 from-gray-50 to-white backdrop-blur-md flex flex-col`}>
        <div className="hidden sm:flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg"><Bot size={24} /></div>
          <div>
            <h2 className="font-semibold text-lg dark:text-emerald-400 text-gray-800">FinMentor AI</h2>
            <p className="text-xs dark:text-gray-400 text-gray-500">Indian Market Analysis</p>
          </div>
        </div>
        
        {/* Mobile Header */}
        <div className="flex sm:hidden items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 text-white"><Bot size={16} /></div>
                <h2 className="font-semibold text-md dark:text-emerald-400 text-gray-800">FinMentor AI</h2>
            </div>
            <ThemeToggleButton className="sm:hidden" />
        </div>
        
        {/* Tab Navigation */}
        <nav className="flex sm:flex-col gap-2 mt-4 sm:mt-0">
          <TabButton tabName="chat" icon={<Sparkles size={16} />} label="AI Chat" />
          <TabButton tabName="portfolio" icon={<Wallet size={16} />} label="Portfolio Generator" />
        </nav>
        
        {/* Theme Toggle */}
        <div className="hidden sm:block mt-auto">
          <ThemeToggleButton className="w-full" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-80px)] sm:h-screen">
        {activeTab === 'chat' && <Chat theme={theme} />}
        {activeTab === 'portfolio' && <PortfolioGenerator theme={theme} />}
      </main>
    </div>
  );
};

export default App;
