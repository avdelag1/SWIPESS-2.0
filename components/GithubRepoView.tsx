
import React, { useState, useEffect } from 'react';
import { signInWithGithub } from '../services/supabaseClient';

interface GithubRepoViewProps {
  session: any;
  onBack?: () => void;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  isLocal?: boolean;
  token?: string;
}

const GithubRepoView: React.FC<GithubRepoViewProps> = ({ session, onBack }) => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeRepo, setActiveRepo] = useState<Repository | null>(null);
  const [manualUrl, setManualUrl] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);

  const fetchRepos = async () => {
    if (isManualMode) return;
    setLoading(true); setError(null);
    try {
      const token = session.provider_token;
      if (!token) { setError("OAuth Restricted."); setLoading(false); return; }
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', { headers: { 'Authorization': `token ${token}` } });
      if (!response.ok) throw new Error("API Failure.");
      setRepos(await response.json());
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { fetchRepos(); }, [session, isManualMode]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full bg-[#0a0a0c] min-h-full">
      <header className="mb-12 flex items-center gap-6">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white active:scale-90 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">Sync Center</h1>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">Repository Logic Lab</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {repos.map(repo => (
          <div key={repo.id} className="bg-[#16161a] border border-white/5 rounded-[2.5rem] p-10 hover:border-white/20 transition-all shadow-xl">
            <h3 className="text-xl font-black text-white mb-2">{repo.name}</h3>
            <p className="text-xs text-slate-600 mb-6 font-medium line-clamp-2">{repo.description || 'Linked Swipess Logic Project'}</p>
            <button className="w-full py-4 bg-white text-black font-black rounded-2xl text-[9px] uppercase tracking-widest">Select Project</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GithubRepoView;
