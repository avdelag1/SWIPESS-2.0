
import React, { useState } from 'react';

interface ProfileViewProps {
  user: any;
  onBack: () => void;
  onUpdate: (newData: any) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onBack, onUpdate }) => {
  const meta = user.user_metadata || {};
  const [formData, setFormData] = useState({
    full_name: meta.full_name || '',
    bio: meta.bio || '',
    location: meta.location || '',
    phone: meta.phone || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(formData);
      setIsSaving(false);
      onBack();
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col items-center bg-[#0a0a0c] p-8 overflow-y-auto custom-scrollbar">
      <header className="w-full max-w-2xl flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-white active:scale-90 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-3xl font-black text-white leading-none tracking-tight">Personal Profile</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Identity Management</p>
          </div>
        </div>
      </header>

      <div className="w-full max-w-2xl bg-[#16161a] border border-white/5 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4d00] to-amber-500" />
        
        <div className="flex flex-col items-center mb-12">
          <div className="relative group">
            <img src={meta.avatar_url} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-[#ff4d00]/20 shadow-2xl transition-all group-hover:scale-105" alt="Profile" />
            <button className="absolute bottom-[-10px] right-[-10px] p-2 bg-white text-black rounded-xl shadow-lg hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16v1h16v-1c0-2.66-5.33-4-8-4s-8 1.34-8 4zm8-12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>
            </button>
          </div>
          <p className="mt-6 text-xl font-black text-white">{meta.full_name || user.email}</p>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Premium Identity • Verified</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                type="text" 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#ff4d00]/40 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location Base</label>
            <input 
              type="text" 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bio / Profile Intro</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-[#0a0a0c] border border-white/5 rounded-[2rem] px-8 py-6 text-sm text-white min-h-[120px] resize-none focus:outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full py-5 bg-white text-black font-black rounded-3xl hover:opacity-90 transition-all uppercase tracking-[0.2em] text-[10px] shadow-2xl active:scale-95"
          >
            {isSaving ? 'Synchronizing...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
      <div className="h-10 flex-shrink-0" />
    </div>
  );
};

export default ProfileView;
