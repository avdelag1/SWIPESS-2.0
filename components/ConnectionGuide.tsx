
import React from 'react';

const ConnectionGuide: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-6 text-slate-100">
      <div className="max-w-2xl w-full space-y-8 bg-[#16161a] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#fe3c72]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Connect Your Backend</h1>
              <p className="text-slate-400 text-sm">Action required to enable Supabase & GitHub auth.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
              <h3 className="text-indigo-400 font-bold text-sm uppercase tracking-widest mb-4">Step 1: Environment Variables</h3>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                Add the following keys to your environment configuration to establish a secure link to your Supabase project:
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl font-mono text-xs border border-white/5">
                  <span className="text-slate-500">SUPABASE_URL</span>
                  <span className="text-emerald-400 select-all">Required</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl font-mono text-xs border border-white/5">
                  <span className="text-slate-500">SUPABASE_ANON_KEY</span>
                  <span className="text-emerald-400 select-all">Required</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
              <h3 className="text-[#fe3c72] font-bold text-sm uppercase tracking-widest mb-4">Step 2: GitHub OAuth</h3>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                In your Supabase Dashboard, go to <span className="text-white font-medium">Authentication > Providers</span> and enable GitHub. Use the following redirect URL:
              </p>
              <div className="p-3 bg-black/40 rounded-xl font-mono text-xs border border-white/5 truncate">
                {window.location.origin}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Awaiting Configuration</span>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-slate-200 transition-all"
            >
              Refresh App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionGuide;
