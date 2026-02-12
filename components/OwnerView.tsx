
import React, { useState, useMemo, useEffect } from 'react';
import { ListingCategory, TransactionType, Listing, ClientProfile } from '../types';
import { GeminiService } from '../services/geminiService';

interface OwnerViewProps {
  onBack?: () => void;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

const MOCK_CLIENTS: ClientProfile[] = [
  { id: 'c1', name: 'Marco Rossi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop', bio: 'Looking for a 2-bedroom apartment in Madrid for a 6-month stay. Prefers modern interiors and high-speed internet for remote work.', lookingFor: ListingCategory.PROPERTY, budget: '€2.500', location: 'MADRID, SPAIN', reliabilityScore: 98 },
  { id: 'c2', name: 'Sofia Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop', bio: 'Pro cyclist looking for a high-end road bike for the upcoming season. Needs carbon frame and electronic shifting.', lookingFor: ListingCategory.BICYCLE, budget: '€10.000', location: 'REMOTE', reliabilityScore: 100 },
  { id: 'c3', name: 'Erik Nilsson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop', bio: 'Full-stack developer looking for a Senior React Architect to audit a core project. Focused on performance and scalability.', lookingFor: ListingCategory.TASKER, budget: '€100/hr', location: 'BERLIN, GERMANY', reliabilityScore: 95 }
];

const OwnerView: React.FC<OwnerViewProps> = ({ onBack, isSidebarOpen, toggleSidebar }) => {
  const [viewState, setViewState] = useState<'dashboard' | 'create' | 'swipe'>('swipe');
  const [isGenerating, setIsGenerating] = useState(false);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<'like' | 'nope' | null>(null);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  
  // Return logic
  const [lastSwipedIndex, setLastSwipedIndex] = useState<number | null>(null);
  const [hasReturnedThisTurn, setHasReturnedThisTurn] = useState(false);

  const [formData, setFormData] = useState<Partial<Listing>>({
    title: '', 
    category: ListingCategory.PROPERTY, 
    transactionType: TransactionType.RENT,
    price: '', 
    location: '', 
    description: '', 
    features: [],
    tags: [],
    skills: [],
    hourlyRate: '',
    projectFee: '',
    duration: '',
    experienceLevel: 'Intermediate'
  });

  const [aiDraftInput, setAiDraftInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  const [myListings, setMyListings] = useState<Listing[]>([
    { id: '1', title: 'Downtown Loft', category: ListingCategory.PROPERTY, price: '€1.100/mo', location: 'Madrid', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', description: 'Cozy loft in the heart of the city.', tags: ['central', 'modern'], ownerId: 'dev', transactionType: TransactionType.RENT },
    { id: '2', title: 'Senior React Dev', category: ListingCategory.TASKER, price: '€65/hr', location: 'Remote', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', description: 'Frontend expert available for hire.', tags: ['react', 'expert'], skills: ['React', 'TypeScript', 'Node.js'], ownerId: 'dev', transactionType: TransactionType.HOURLY },
  ]);

  const activeClient = MOCK_CLIENTS[swipeIndex];

  useEffect(() => {
    if (formData.category !== ListingCategory.TASKER) setSkillsInput('');
  }, [formData.category]);

  const handleSwipe = (dir: 'like' | 'nope') => {
    if (swipeDir || !activeClient) return;
    
    setLastSwipedIndex(swipeIndex);
    setHasReturnedThisTurn(false);

    setSwipeDir(dir);
    setIsDetailExpanded(false);
    if (dir === 'like' && Math.random() > 0.4) setTimeout(() => setShowMatch(true), 400);
    setTimeout(() => {
      setSwipeDir(null);
      setSwipeIndex((prev) => (prev + 1) % MOCK_CLIENTS.length);
    }, 400);
  };

  const handleReturn = () => {
    if (lastSwipedIndex === null || hasReturnedThisTurn) return;
    setSwipeIndex(lastSwipedIndex);
    setHasReturnedThisTurn(true);
    setLastSwipedIndex(null);
  };

  const handleShare = async () => {
    if (!activeClient) return;
    const shareData = {
      title: `MatchLogic | Check out this prospect: ${activeClient.name}`,
      text: activeClient.bio,
      url: `${window.location.origin}/prospect/${activeClient.id}`
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Prospect link copied!');
      }
    } catch (err) { console.error(err); }
  };

  const handleAiGenerate = async () => {
    if (!aiDraftInput.trim()) return;
    setIsGenerating(true);
    try {
      const draft = await GeminiService.generateOptimizedListing(aiDraftInput, formData.category || ListingCategory.PROPERTY);
      setFormData(prev => ({
        ...prev,
        title: draft.title || prev.title,
        description: draft.description || prev.description,
        features: draft.features || prev.features,
        tags: draft.tags || prev.tags,
        price: draft.suggestedPrice || prev.price
      }));
      if (draft.tags) setTagsInput(draft.tags.join(', '));
    } catch (err) { console.error(err); } finally { setIsGenerating(false); }
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFormData(prev => ({ ...prev, features: [...(prev.features || []), featureInput.trim()] }));
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({ ...prev, features: (prev.features || []).filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalListing: Listing = {
      ...formData as Listing,
      id: Date.now().toString(),
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      tags: tagsInput.split(',').map(s => s.trim()).filter(s => s !== ''),
      skills: skillsInput.split(',').map(s => s.trim()).filter(s => s !== ''),
      ownerId: 'dev'
    };
    setMyListings(prev => [finalListing, ...prev]);
    setViewState('dashboard');
    setFormData({ category: ListingCategory.PROPERTY, features: [], tags: [] });
    setAiDraftInput(''); setTagsInput(''); setSkillsInput(''); setFeatureInput('');
  };

  const renderSwipeView = () => (
    <div className="h-full flex flex-col items-center bg-[#0a0a0c] overflow-hidden relative">
      {showMatch && (
        <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-scale-in p-8 text-center">
           <div className="relative mb-16">
              <div className="absolute inset-0 bg-[#ff4d00] blur-[120px] opacity-30 animate-pulse"></div>
              <h2 className="text-8xl font-black text-white italic tracking-tighter mb-4 drop-shadow-[0_10px_30px_rgba(255,77,0,0.5)]">Matched!</h2>
              <p className="text-[#ff4d00] font-black uppercase tracking-[0.5em] text-[10px]">Lead Confirmed</p>
           </div>
           <div className="flex items-center gap-6 mb-16">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" className="w-28 h-28 rounded-full border-4 border-white/10 shadow-2xl" alt="Owner" />
              <div className="text-white text-4xl font-black animate-bounce">
                <svg className="w-12 h-12 text-[#ff4d00]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2C12,2,12,4,10,6C8,8,6.5,10.5,6.5,13.5C6.5,17.1,9.4,20,13,20C16.6,20,19.5,17.1,19.5,13.5C19.5,11.1,18.4,8.9,16,7.5C16.6,8.6,16.8,9.7,16.8,11.1C16.8,12.6,16.1,13.8,15.1,14.7C14.3,15.4,13.5,16,12.5,16.2V11C12.5,10,12.8,9.1,13.4,8.4C12.1,9.2,11.5,10.5,11.5,12V2Z" />
                </svg>
              </div>
              <img src={activeClient?.avatar} className="w-28 h-28 rounded-full border-4 border-[#ff4d00] shadow-2xl" alt="Client" />
           </div>
           <div className="flex flex-col gap-4 w-full max-w-xs">
             <button onClick={() => setShowMatch(false)} className="w-full py-5 bg-white text-black font-black rounded-[2.5rem] uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all">Start Converation</button>
             <button onClick={() => setShowMatch(false)} className="w-full py-5 bg-white/5 border border-white/10 text-slate-400 font-black rounded-[2.5rem] uppercase tracking-widest text-[11px] hover:text-white transition-all">Keep Swiping</button>
           </div>
        </div>
      )}

      <header className="w-full max-w-[480px] px-6 pt-8 flex items-center justify-between z-50">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-white shadow-xl active:scale-90 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg></button>
            <div>
               <h1 className="text-xl font-black text-white leading-none tracking-tight">Discovery</h1>
               <p className="text-[9px] font-black text-[#ff4d00] uppercase tracking-widest mt-1">Lead Prospecting</p>
            </div>
         </div>
         <button onClick={() => setViewState('dashboard')} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Portfolio</button>
      </header>

      <div className="flex-1 w-full max-w-[480px] relative flex items-center justify-center p-6">
        {activeClient ? (
          <div className="relative w-full h-full max-h-[720px] aspect-[9/16]">
            <div className={`absolute inset-0 bg-[#16161a] rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/5 transition-all duration-400 ease-out ${swipeDir === 'like' ? 'translate-x-[150%] rotate-[20deg]' : ''} ${swipeDir === 'nope' ? '-translate-x-[150%] -rotate-[20deg]' : ''}`}>
              <img src={activeClient.avatar} className="w-full h-full object-cover pointer-events-none select-none" alt={activeClient.name} />
              <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-10 transition-all ${isDetailExpanded ? 'bg-black/95 pt-20 overflow-y-auto' : ''}`}>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-4xl font-black text-white tracking-tighter leading-none">{activeClient.name}</h2>
                    <div className="px-3 py-1 bg-[#ff4d00] rounded-full text-[9px] font-black text-white shadow-xl shadow-orange-600/30">{activeClient.reliabilityScore}%</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black tracking-widest uppercase mb-6 opacity-80">
                    <svg className="w-3.5 h-3.5 text-[#ff4d00]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
                    {activeClient.location}
                  </div>
                  <div className="bg-black/40 rounded-3xl p-6 border border-white/10 mb-8 backdrop-blur-md">
                     <p className="text-white font-black text-2xl mb-1">{activeClient.budget}</p>
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Budget • {activeClient.lookingFor}</p>
                  </div>
                  <p className={`text-slate-300 text-sm leading-relaxed mb-8 font-medium ${isDetailExpanded ? '' : 'line-clamp-3'}`}>{activeClient.bio}</p>
                  <button onClick={() => setIsDetailExpanded(!isDetailExpanded)} className="text-[10px] font-black text-[#ff4d00] uppercase tracking-[0.2em] hover:text-white transition-all">{isDetailExpanded ? 'SHOW LESS' : 'VIEW FULL BIO'}</button>
                </div>
                {!isDetailExpanded && (
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <button onClick={() => handleSwipe('nope')} className="w-14 h-14 bg-white/10 border border-white/5 rounded-full flex items-center justify-center text-red-500 active:scale-90 transition-all shadow-xl backdrop-blur-md">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                    
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl">
                      <button onClick={() => {}} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-blue-400 active:scale-90 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                      </button>
                      <button 
                        onClick={handleReturn} 
                        disabled={lastSwipedIndex === null || hasReturnedThisTurn}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${lastSwipedIndex !== null && !hasReturnedThisTurn ? 'bg-white/10 text-amber-400' : 'bg-transparent text-slate-700 opacity-30 cursor-not-allowed'}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                      </button>
                      <button onClick={handleShare} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-emerald-400 active:scale-90 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                      </button>
                    </div>

                    <button onClick={() => handleSwipe('like')} className="w-18 h-18 bg-[#ff4d00] rounded-full flex items-center justify-center text-white active:scale-90 transition-all shadow-[0_20px_40px_-5px_rgba(255,77,0,0.4)]">
                      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2C12,2,12,4,10,6C8,8,6.5,10.5,6.5,13.5C6.5,17.1,9.4,20,13,20C16.6,20,19.5,17.1,19.5,13.5C19.5,11.1,18.4,8.9,16,7.5C16.6,8.6,16.8,9.7,16.8,11.1C16.8,12.6,16.1,13.8,15.1,14.7C14.3,15.4,13.5,16,12.5,16.2V11C12.5,10,12.8,9.1,13.4,8.4C12.1,9.2,11.5,10.5,11.5,12V2Z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-16 animate-view-entry">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse"><svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></div>
            <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.3em]">No more leads today</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDashboardView = () => (
    <div className="h-full flex flex-col p-8 lg:p-12 max-w-7xl mx-auto w-full bg-[#0a0a0c] overflow-y-auto custom-scrollbar animate-view-entry">
      <header className="mb-12 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white active:scale-90 transition-all shadow-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg></button>
          <div><h1 className="text-4xl font-black text-white tracking-tighter leading-none">Portfolio</h1><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Active Items</p></div>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => setViewState('swipe')} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-all">Discovery</button>
           <button onClick={() => setViewState('create')} className="px-8 py-4 bg-[#ff4d00] text-white rounded-3xl font-black hover:opacity-90 shadow-2xl shadow-orange-600/30 uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all active:scale-95"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>List New</button>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10">
        {myListings.map((l, idx) => (
          <div key={l.id} style={{ animationDelay: `${idx * 0.05}s` }} className="bg-[#16161a] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-full animate-view-entry">
             <div className="relative h-56 overflow-hidden">
               <img src={l.image} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt={l.title} />
               <div className="absolute top-5 left-5"><span className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[8px] font-black text-white uppercase tracking-widest border border-white/10">Active</span></div>
               <div className="absolute top-5 right-5"><span className="px-3 py-1.5 bg-[#ff4d00] rounded-xl text-[8px] font-black text-white uppercase tracking-widest shadow-xl">{l.category}</span></div>
             </div>
             <div className="p-8 flex flex-col flex-1">
                <h3 className="text-xl font-black text-white mb-2 group-hover:text-[#ff4d00] transition-colors">{l.title}</h3>
                <p className="text-[#ff4d00] font-black text-lg mb-6">{l.price}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCreateView = () => (
    <div className="h-full flex flex-col p-8 lg:p-16 max-w-5xl mx-auto w-full overflow-y-auto custom-scrollbar bg-[#0a0a0c] animate-view-entry">
      <header className="flex items-center justify-between mb-12 flex-shrink-0">
        <button onClick={() => setViewState('dashboard')} className="flex items-center gap-3 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group"><div className="p-2 bg-white/5 rounded-xl group-hover:bg-white/10"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg></div>Discard Draft</button>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-[#ff4d00]/5 rounded-2xl border border-[#ff4d00]/20"><div className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse shadow-[0_0_10px_#ff4d00]"></div><span className="text-[9px] font-black uppercase text-[#ff4d00] tracking-widest">Magic Agent Online</span></div>
      </header>
      <div className={`mb-16 p-12 rounded-[3.5rem] border transition-all duration-1000 relative overflow-hidden group shadow-2xl ${isGenerating ? 'bg-[#ff4d00]/10 border-[#ff4d00]/50 animate-pulse' : 'bg-gradient-to-br from-[#1c1c21] to-[#0f0f12] border-white/5'}`}>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4"><div className="p-3 bg-[#ff4d00] rounded-2xl shadow-xl shadow-orange-600/30"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div><h2 className="text-2xl font-black text-white tracking-tight">AI Listing Generator</h2></div>
          <p className="text-slate-400 text-sm mb-10 font-medium max-w-lg leading-relaxed">Provide keywords. Our AI crafts an optimized title, content, and price.</p>
          <div className="space-y-6">
            <textarea value={aiDraftInput} onChange={(e) => setAiDraftInput(e.target.value)} placeholder="Describe your offer..." className="w-full bg-black/50 border border-white/10 rounded-[2.5rem] px-10 py-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff4d00]/40 min-h-[160px] transition-all backdrop-blur-xl shadow-inner placeholder:text-slate-800" />
            <button onClick={handleAiGenerate} disabled={isGenerating || !aiDraftInput.trim()} className="w-full py-7 bg-[#ff4d00] text-white font-black rounded-[2.5rem] text-[13px] uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-5">
              {isGenerating ? (<><div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>GENERATING...</>) : (<>DRAFT WITH A.I.</>)}
            </button>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.values(ListingCategory).map((cat) => (
            <button key={cat} type="button" onClick={() => setFormData({...formData, category: cat})} className={`flex flex-col items-center justify-center py-8 rounded-[2.5rem] border-2 transition-all group ${formData.category === cat ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}>
              <span className={`text-4xl mb-3 transition-transform ${formData.category === cat ? 'scale-110' : 'group-hover:scale-110'}`}>{cat === ListingCategory.PROPERTY ? '🏙️' : cat === ListingCategory.MOTO ? '🏍️' : cat === ListingCategory.BICYCLE ? '🚲' : '🤝'}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label><input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Title" className="w-full bg-[#16161a] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white focus:outline-none shadow-xl" /></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Price</label><input type="text" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="€0.00" className="w-full bg-[#16161a] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white focus:outline-none shadow-xl" /></div>
            <div className="space-y-4"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label><input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="City" className="w-full bg-[#16161a] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white focus:outline-none shadow-xl" /></div>
          </div>
        </div>
        <div className="space-y-4"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label><textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="AI generated description..." className="w-full bg-[#16161a] border border-white/10 rounded-[3rem] px-10 py-10 text-sm text-white min-h-[200px] resize-none focus:outline-none shadow-xl leading-relaxed" /></div>
        <button type="submit" className="w-full py-9 bg-white text-black font-black rounded-[3rem] uppercase tracking-[0.3em] text-[13px] shadow-2xl active:scale-[0.98] transition-all mt-10 hover:bg-slate-100">Publish Listing</button>
      </form>
    </div>
  );

  return (<div className="h-full w-full"><div key={viewState} className="h-full w-full animate-view-entry">{viewState === 'swipe' && renderSwipeView()}{viewState === 'dashboard' && renderDashboardView()}{viewState === 'create' && renderCreateView()}</div></div>);
};

export default OwnerView;
