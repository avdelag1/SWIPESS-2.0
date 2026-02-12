
import React from 'react';
import { DashboardMode, ListingCategory, AppView } from '../types';
import { signOut } from '../services/supabaseClient';

interface SidebarProps {
  mode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  category: ListingCategory;
  setCategory: (cat: ListingCategory) => void;
  isOpen: boolean;
  onToggle: () => void;
  user: any;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  mode, 
  setMode, 
  activeView, 
  setActiveView, 
  category, 
  setCategory, 
  isOpen, 
  onToggle,
  user
}) => {
  const categories = [
    { id: ListingCategory.PROPERTY, label: 'Real Estate', icon: '🏙️' },
    { id: ListingCategory.MOTO, label: 'Motors', icon: '🏍️' },
    { id: ListingCategory.BICYCLE, label: 'Cycles', icon: '🚲' },
    { id: ListingCategory.TASKER, label: 'Jobs & Taskers', icon: '🤝' },
  ];

  const aiTools = [
    { id: AppView.CHAT, label: 'AI Concierge', icon: '🪄' },
    { id: AppView.IMAGE, label: 'Visualizer', icon: '🎨' },
    { id: AppView.VIDEO, label: 'Video Lab', icon: '🎬' },
    { id: AppView.VOICE, label: 'Voice AI', icon: '🎙️' },
    { id: AppView.GITHUB, label: 'Sync Lab', icon: '📁' },
  ];

  const isDiscoveryActive = activeView === AppView.DISCOVERY && mode === DashboardMode.CLIENT;

  return (
    <div className={`fixed lg:relative inset-y-0 left-0 bg-[#16161a] border-r border-white/5 transition-all duration-300 ease-in-out flex flex-col z-[70] ${isOpen ? 'w-72 translate-x-0' : 'w-72 lg:w-0 -translate-x-full lg:overflow-hidden'}`}>
      <div className="p-8 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#ff4d00] to-[#ffb700] rounded-[1.2rem] flex items-center justify-center shadow-2xl shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.5,2C11.5,2,11.5,4,9.5,6C7.5,8,6,10.5,6,13.5C6,17.1,8.9,20,12.5,20C16.1,20,19,17.1,19,13.5C19,11.1,17.9,8.9,16,7.5C16.6,8.6,16.8,9.7,16.8,11.1C16.8,12.6,16.1,13.8,15.1,14.7C14.3,15.4,13.5,16,12.5,16.2V11C12.5,10,12.8,9.1,13.4,8.4C12.1,9.2,11.5,10.5,11.5,12V2Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">Swipess</h1>
            <p className="text-[10px] font-bold text-[#ff4d00] uppercase tracking-[0.2em] mt-1">MatchLogic</p>
          </div>
        </div>

        <div className="flex bg-[#0a0a0c] p-1.5 rounded-2xl border border-white/5">
          <button 
            onClick={() => setMode(DashboardMode.CLIENT)}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === DashboardMode.CLIENT ? 'bg-[#ff4d00] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Client
          </button>
          <button 
            onClick={() => setMode(DashboardMode.OWNER)}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === DashboardMode.OWNER ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Owner
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 py-8 space-y-10 custom-scrollbar">
        {mode === DashboardMode.CLIENT && (
          <>
            <div>
              <p className="px-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Discovery</p>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${isDiscoveryActive && category === cat.id ? 'bg-white/[0.05] text-white' : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-300'}`}
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="font-bold text-sm tracking-tight">{cat.label}</span>
                    {isDiscoveryActive && category === cat.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ff4d00] shadow-[0_0_8px_#ff4d00]" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="px-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Lab Modules</p>
              <div className="space-y-1">
                {aiTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveView(tool.id)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${activeView === tool.id && mode === DashboardMode.CLIENT ? 'bg-white/[0.05] text-white' : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-300'}`}
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{tool.icon}</span>
                    <span className="font-bold text-sm tracking-tight">{tool.label}</span>
                    {activeView === tool.id && mode === DashboardMode.CLIENT && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        
        {mode === DashboardMode.OWNER && (
           <div className="px-2 py-2 space-y-6">
              <p className="px-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Operations</p>
              <button 
                onClick={() => setActiveView(AppView.DISCOVERY)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${activeView === AppView.DISCOVERY ? 'bg-white/[0.05] text-white' : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-300'}`}
              >
                <span className="text-xl">🤝</span>
                <span className="font-bold text-sm">Client Swiping</span>
              </button>
             <div className="p-6 bg-gradient-to-br from-[#1c1c21] to-[#0a0a0c] rounded-[2rem] border border-white/5 mt-6">
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-3">Revenue Hub</p>
                <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Open Analytics
                </button>
             </div>
           </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 space-y-4 bg-black/20 flex-shrink-0">
        <button 
          onClick={() => setActiveView(AppView.PROFILE)}
          className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${activeView === AppView.PROFILE ? 'bg-[#ff4d00]/10 border border-[#ff4d00]/20' : 'hover:bg-white/5'}`}
        >
          <div className="relative flex-shrink-0">
            <img 
              src={user.user_metadata.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
              className="w-10 h-10 rounded-xl object-cover border border-[#ff4d00]/30"
              alt="Profile" 
            />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-black truncate text-white">{user.user_metadata.full_name || user.email}</p>
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">My Profile</p>
          </div>
        </button>

        <button 
          onClick={() => signOut()}
          className="w-full py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-red-500 transition-all"
        >
          Disconnect Session
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
