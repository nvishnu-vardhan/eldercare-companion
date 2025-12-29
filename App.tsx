
import React, { useState } from 'react';
import { UserRole, Message } from './types';
import ParentChat from './components/ParentChat';
import ChildDashboard from './components/ChildDashboard';
import { User, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.PARENT);
  const [logs, setLogs] = useState<Message[]>([]);

  const handleNewLog = (msg: Message) => {
    setLogs(prev => [...prev, msg]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-7xl mx-auto shadow-2xl">
      <nav className="bg-white border-b px-6 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">E</div>
          <span className="font-bold text-gray-800 tracking-tight">ElderCare</span>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200">
          <button 
            onClick={() => setRole(UserRole.PARENT)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              role === UserRole.PARENT 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User size={16} />
            Parent View
          </button>
          <button 
            onClick={() => setRole(UserRole.CHILD)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              role === UserRole.CHILD 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldCheck size={16} />
            Child View
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative">
        {role === UserRole.PARENT ? (
          <div className="h-full animate-in fade-in duration-300">
            <ParentChat onNewLog={handleNewLog} />
          </div>
        ) : (
          <div className="h-full overflow-y-auto animate-in fade-in duration-300">
            <ChildDashboard logs={logs} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t px-6 py-2 flex justify-between items-center text-[10px] text-gray-400 font-medium uppercase tracking-widest shrink-0">
        <div className="flex items-center gap-4">
          <span>Region: Jaipur, IN</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Safety Guard Active
          </span>
        </div>
        <div>ElderCare v1.2 • AI Care Companion</div>
      </footer>
    </div>
  );
};

export default App;
