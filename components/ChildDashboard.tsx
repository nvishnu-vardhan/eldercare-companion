
import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  MessageSquare,
  ArrowRight,
  Phone,
  MapPin,
  ShieldCheck,
  PlayCircle,
  // Fix: Added missing icon import
  Image as ImageIcon
} from 'lucide-react';
import { generateElderResponse } from '../services/geminiService';
import { UserRole, Message } from '../types';

interface ChildDashboardProps {
  logs: Message[];
}

const ChildDashboard: React.FC<ChildDashboardProps> = ({ logs }) => {
  const [query, setQuery] = useState('');
  const [updateText, setUpdateText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const lastLocation = [...logs].reverse().find(l => l.location)?.location;

  const getUpdate = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    const recentActivity = logs.slice(-5).map(l => `${l.role === 'user' ? 'Parent' : 'ElderCare'}: ${l.content}`).join('\n');
    const context = `Activity Log:\n${recentActivity}\n\nQuestion: ${query || "What is today's status?"}`;
    
    const response = await generateElderResponse(context, UserRole.CHILD, []);
    setUpdateText(response);
    setIsLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dad's Care Dashboard</h1>
          <p className="text-gray-500">Living in Jaipur, India • {lastLocation ? 'Location Active' : 'Waiting for check-in'}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Phone size={18} />
            Call Dad
          </button>
          <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Bell size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Health Status</h3>
            <p className="text-sm text-gray-500 mt-1">Check-in complete. Meds confirmed.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Safety Guard</h3>
            {lastLocation ? (
              <p className="text-sm text-blue-600 font-medium underline cursor-pointer mt-1">
                Last seen: {lastLocation.lat.toFixed(2)}, {lastLocation.lng.toFixed(2)} (Home)
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">No location shared recently.</p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
            <PlayCircle size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Media Vault</h3>
            <p className="text-sm text-gray-500 mt-1">{logs.filter(l => l.media).length} new photos/audio notes</p>
          </div>
        </div>
      </div>

      <div className="bg-indigo-900 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <Activity size={18} />
              </div>
              Care Assistant AI
            </h2>
            <div className="flex gap-2">
              <input 
                type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about Dad's day..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/20 transition-all"
              />
              <button onClick={getUpdate} disabled={isLoading}
                className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                {isLoading ? "Analyzing..." : "Update"}
                <ArrowRight size={18} />
              </button>
            </div>
            {updateText && (
              <div className="mt-6 bg-white/10 border border-white/10 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-lg leading-relaxed">{updateText}</p>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 blur-3xl opacity-20 -mr-32 -mt-32 rounded-full"></div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={20} className="text-gray-400" />
          Care Timeline
        </h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No activity logged yet.</div>
          ) : (
            [...logs].reverse().slice(0, 5).map((item, i) => (
              <div key={i} className="p-4 flex gap-4 items-start hover:bg-gray-50 transition-colors">
                <div className="mt-1">
                  {item.media ? <ImageIcon size={20} className="text-orange-400" /> : <MessageSquare size={20} className="text-gray-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">{item.role === 'user' ? 'Parent Update' : 'ElderCare Message'}</span>
                    <span className="text-xs text-gray-400 font-medium">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{item.content}</p>
                  {item.media && (
                    <div className="mt-2 flex gap-2">
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-500 uppercase">
                        {item.media.mimeType.split('/')[0]} ATTACHED
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildDashboard;
