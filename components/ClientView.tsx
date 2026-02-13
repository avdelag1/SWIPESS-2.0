
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ListingCategory, Listing, TransactionType, AIFilters, InteractionRecord } from '../types';
import { GeminiService } from '../services/geminiService';

interface ClientViewProps {
  activeCategory: ListingCategory;
  setCategory?: (cat: ListingCategory) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  onChatClick: () => void;
  /** Listings arriving from Supabase Realtime. Merged with mock data for the feed. */
  realtimeListings?: Listing[];
  /** A listing that was just published by another user (for toast notification). */
  newListingAlert?: Listing | null;
  /** Dismiss the new-listing toast. */
  onDismissAlert?: () => void;
}

const MOCK_DATA: Record<ListingCategory, Listing[]> = {
  [ListingCategory.PROPERTY]: [
    {
      id: 'p1', title: 'Penthouse Skyline', category: ListingCategory.PROPERTY, price: '€2.400/mo', location: 'MADRID, SALAMANCA',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      description: 'Luxurious penthouse with private elevator and 360-degree views of the city.',
      tags: ['luxury', 'terrace', 'central', 'madrid', 'penthouse'], ownerId: 'dev', transactionType: TransactionType.RENT,
      bedrooms: 3, bathrooms: 2, sqft: 180
    },
    {
      id: 'p2', title: 'Modern Garden Villa', category: ListingCategory.PROPERTY, price: '€4.100/mo', location: 'BARCELONA, PEDRALBES',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
      description: 'Stunning villa with private pool and automated garden lighting.',
      tags: ['pool', 'garden', 'family', 'barcelona', 'villa'], ownerId: 'dev', transactionType: TransactionType.RENT,
      bedrooms: 5, bathrooms: 4, sqft: 350
    },
    {
      id: 'p3', title: 'Cozy Studio Loft', category: ListingCategory.PROPERTY, price: '€950/mo', location: 'VALENCIA, RUZAFA',
      image: 'https://images.unsplash.com/photo-1536376074432-8d63d592bfde?auto=format&fit=crop&w=800&q=80',
      description: 'Industrial style loft in the trendiest neighborhood of Valencia.',
      tags: ['loft', 'industrial', 'wifi', 'valencia'], ownerId: 'dev', transactionType: TransactionType.RENT,
      bedrooms: 1, bathrooms: 1, sqft: 45
    },
    {
      id: 'p4', title: 'Rustic Country House', category: ListingCategory.PROPERTY, price: '€1.200/mo', location: 'SEVILLA',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&w=800&q=80',
      description: 'A quiet place away from the city noise.',
      tags: ['countryside', 'quiet', 'nature', 'sevilla'], ownerId: 'dev', transactionType: TransactionType.RENT,
      bedrooms: 3, bathrooms: 1, sqft: 120
    }
  ],
  [ListingCategory.MOTO]: [
    {
      id: 'm1', title: 'Porsche Taycan 2023', category: ListingCategory.MOTO, price: '€92.000', location: 'BARCELONA, SPAIN',
      image: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=800&q=80',
      description: 'Electric performance at its peak. Gentian Blue Metallic.',
      tags: ['electric', 'porsche', 'sport', 'barcelona'], ownerId: 'dev', transactionType: TransactionType.SALE,
      year: 2023, mileage: '5.200 km', engineSize: '400 kW'
    },
    {
      id: 'm2', title: 'Ducati Panigale V4', category: ListingCategory.MOTO, price: '€24.500', location: 'MADRID, SPAIN',
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
      description: 'The ultimate track machine for the road. Racing red.',
      tags: ['racing', 'ducati', 'v4', 'madrid'], ownerId: 'dev', transactionType: TransactionType.SALE,
      year: 2022, mileage: '1.800 km', engineSize: '1103 cc'
    }
  ],
  [ListingCategory.BICYCLE]: [
    {
      id: 'b1', title: 'Specialized S-Works', category: ListingCategory.BICYCLE, price: '€8.500', location: 'REMOTE / EUROPE',
      image: 'https://images.unsplash.com/photo-1532298229144-0ee0c57515ec?auto=format&fit=crop&w=800&q=80',
      description: 'Competition-grade carbon fiber road bike. Ultra-lightweight.',
      tags: ['road', 'carbon', 'pro', 'remote'], ownerId: 'dev', transactionType: TransactionType.SALE,
      frameMaterial: 'Fact 12r Carbon', weight: '6.8 kg'
    },
    {
      id: 'b2', title: 'Santa Cruz Nomad', category: ListingCategory.BICYCLE, price: '€5.200', location: 'ANDORRA',
      image: 'https://images.unsplash.com/photo-1576433732326-44d5ff9a0c5e?auto=format&fit=crop&w=800&q=80',
      description: 'Enduro beast for the roughest trails. CC Carbon frame.',
      tags: ['mtb', 'enduro', 'carbon', 'andorra'], ownerId: 'dev', transactionType: TransactionType.SALE,
      frameMaterial: 'Carbon CC', weight: '14.2 kg'
    }
  ],
  [ListingCategory.TASKER]: [
    {
      id: 't1', title: 'Lead React Architect', category: ListingCategory.TASKER, price: '€85/hr', location: 'REMOTE / BERLIN',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      description: 'Expert in high-performance WebGL and React applications.',
      tags: ['react', 'webgl', 'expert', 'remote', 'berlin'], ownerId: 'dev', transactionType: TransactionType.HOURLY,
      experienceLevel: 'Expert', skills: ['TypeScript', 'Three.js', 'Next.js'],
      hourlyRate: '€85.00', projectFee: '€2.5k+', duration: 'Ongoing'
    },
    {
      id: 't2', title: 'UI Designer', category: ListingCategory.TASKER, price: '€45/hr', location: 'REMOTE / MADRID',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80',
      description: 'Creating minimalist interfaces for modern SaaS platforms.',
      tags: ['figma', 'ui', 'saas', 'remote', 'madrid'], ownerId: 'dev', transactionType: TransactionType.HOURLY,
      experienceLevel: 'Intermediate', skills: ['Figma', 'Prototyping', 'Design Systems'],
      hourlyRate: '€45.00', projectFee: '€1k+', duration: 'Project Basis'
    }
  ]
};

const ClientView: React.FC<ClientViewProps> = ({ activeCategory, setCategory, isSidebarOpen, toggleSidebar, onChatClick, realtimeListings = [], newListingAlert, onDismissAlert }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'nope' | null>(null);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [aiFilters, setAiFilters] = useState<AIFilters | null>(null);

  const [interactionHistory, setInteractionHistory] = useState<InteractionRecord[]>([]);
  const [isReranking, setIsReranking] = useState(false);
  const [rankedIds, setRankedIds] = useState<string[]>([]);
  const viewStartTime = useRef<number>(Date.now());

  // Return logic state
  const [lastSwipedIndex, setLastSwipedIndex] = useState<number | null>(null);
  const [hasReturnedThisTurn, setHasReturnedThisTurn] = useState(false);

  const filteredBase = useMemo(() => {
    const mockBase = MOCK_DATA[activeCategory] || [];
    // Merge realtime listings for this category (placed first so new ones appear at top)
    const realtimeForCategory = realtimeListings.filter(l => l.category === activeCategory);
    const mockIds = new Set(mockBase.map(l => l.id));
    const deduped = realtimeForCategory.filter(l => !mockIds.has(l.id));
    let base = [...deduped, ...mockBase];

    if (!aiFilters) return base;
    return base.filter(l => {
      if (aiFilters.maxPrice) {
        const numericPrice = parseFloat(l.price.replace(/[^0-9.]/g, ''));
        if (numericPrice > aiFilters.maxPrice) return false;
      }
      if (aiFilters.location && !l.location.toLowerCase().includes(aiFilters.location.toLowerCase())) {
        return false;
      }
      if (aiFilters.tags && aiFilters.tags.length > 0) {
        const hasTag = aiFilters.tags.some(tag =>
          l.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())) ||
          l.title.toLowerCase().includes(tag.toLowerCase())
        );
        if (!hasTag) return false;
      }
      return true;
    });
  }, [activeCategory, aiFilters, realtimeListings]);

  const currentListings = useMemo(() => {
    if (rankedIds.length === 0) return filteredBase;
    const sorted = [...filteredBase].sort((a, b) => {
      const indexA = rankedIds.indexOf(a.id);
      const indexB = rankedIds.indexOf(b.id);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    return sorted;
  }, [filteredBase, rankedIds]);

  const activeListing = currentListings[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setSwipeDirection(null);
    setIsDetailExpanded(false);
    setRankedIds([]);
    setLastSwipedIndex(null);
    setHasReturnedThisTurn(false);
    viewStartTime.current = Date.now();
  }, [activeCategory, aiFilters]);

  const handleSwipe = async (direction: 'like' | 'nope') => {
    if (swipeDirection || !activeListing) return;
    
    setLastSwipedIndex(currentIndex);
    setHasReturnedThisTurn(false); // Reset undo capability for the new "current" card after it gets swiped

    const duration = Date.now() - viewStartTime.current;
    const record: InteractionRecord = {
      listingId: activeListing.id,
      action: direction,
      duration: duration,
      timestamp: Date.now()
    };
    const newHistory = [...interactionHistory, record];
    setInteractionHistory(newHistory);
    setSwipeDirection(direction);
    setIsDetailExpanded(false);
    
    if (newHistory.length % 3 === 0 && currentListings.length > currentIndex + 1) {
      triggerReRank(newHistory);
    }

    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentIndex((prev) => (prev + 1) % (currentListings.length || 1));
      viewStartTime.current = Date.now();
    }, 300);
  };

  const handleReturn = () => {
    if (lastSwipedIndex === null || hasReturnedThisTurn) return;
    setCurrentIndex(lastSwipedIndex);
    setHasReturnedThisTurn(true);
    setLastSwipedIndex(null);
  };

  const triggerReRank = async (history: InteractionRecord[]) => {
    setIsReranking(true);
    try {
      const candidates = filteredBase.slice(currentIndex + 1);
      if (candidates.length > 1) {
        const newRanking = await GeminiService.rankRecommendations(history, candidates);
        setRankedIds(newRanking);
      }
    } catch (err) {
      console.error("Re-ranking failed:", err);
    } finally {
      setIsReranking(false);
    }
  };

  const handleShare = async () => {
    if (!activeListing) return;
    const shareData = {
      title: `MatchLogic | Check out this ${activeListing.category}: ${activeListing.title}`,
      text: activeListing.description,
      url: `${window.location.origin}/share/${activeListing.id}`
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Listing link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleSearchSubmit = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsParsing(true);
      try {
        const extracted = await GeminiService.extractFiltersFromQuery(searchQuery);
        if (extracted.category && extracted.category !== activeCategory && setCategory) {
          setCategory(extracted.category as ListingCategory);
        }
        setAiFilters(extracted);
      } catch (err) {
        console.error(err);
      } finally {
        setIsParsing(false);
      }
    }
  };

  const clearFilters = () => {
    setAiFilters(null);
    setSearchQuery('');
    setRankedIds([]);
  };

  const renderCategoryFields = (listing: Listing) => {
    switch (listing.category) {
      case ListingCategory.PROPERTY:
        return (
          <div className="grid grid-cols-3 gap-4 mb-4 border-y border-white/5 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Beds</p>
              <p className="text-white font-bold">{listing.bedrooms}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Baths</p>
              <p className="text-white font-bold">{listing.bathrooms}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Sqft</p>
              <p className="text-white font-bold">{listing.sqft}m²</p>
            </div>
          </div>
        );
      case ListingCategory.MOTO:
        return (
          <div className="grid grid-cols-3 gap-4 mb-4 border-y border-white/5 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Year</p>
              <p className="text-white font-bold">{listing.year}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Mileage</p>
              <p className="text-white font-bold">{listing.mileage}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Engine</p>
              <p className="text-white font-bold">{listing.engineSize}</p>
            </div>
          </div>
        );
      case ListingCategory.BICYCLE:
        return (
          <div className="grid grid-cols-2 gap-4 mb-4 border-y border-white/5 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Material</p>
              <p className="text-white font-bold text-[11px] truncate px-2">{listing.frameMaterial}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Weight</p>
              <p className="text-white font-bold">{listing.weight}</p>
            </div>
          </div>
        );
      case ListingCategory.TASKER:
        return (
          <div className="mb-4 border-y border-white/5 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-3 gap-4 mb-6 px-2">
               <div className="text-center">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Hourly</p>
                 <p className="text-white font-bold text-xs">{listing.hourlyRate || 'N/A'}</p>
               </div>
               <div className="text-center">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Project</p>
                 <p className="text-white font-bold text-xs">{listing.projectFee || 'N/A'}</p>
               </div>
               <div className="text-center">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Duration</p>
                 <p className="text-white font-bold text-xs">{listing.duration || 'N/A'}</p>
               </div>
            </div>
            <div className="flex justify-between items-center mb-4 px-2">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Experience</p>
               <p className="text-[#ff4d00] font-black text-[11px] uppercase tracking-widest">{listing.experienceLevel}</p>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase mb-2 px-2 tracking-widest">Core Skills</p>
            <div className="flex flex-wrap gap-2 px-2">
              {listing.skills?.map(s => <span key={s} className="px-3 py-1 bg-[#ff4d00]/10 text-[#ff4d00] rounded-full text-[10px] font-bold border border-[#ff4d00]/20">{s}</span>)}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center bg-[#0a0a0c] overflow-hidden relative">
      {/* Realtime new-listing toast notification */}
      {newListingAlert && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[440px] px-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-[#1c1c21] border border-[#ff4d00]/30 rounded-3xl p-4 shadow-2xl shadow-orange-600/10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
              <img src={newListingAlert.image} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-black text-[#ff4d00] uppercase tracking-widest mb-1">New listing just dropped</p>
              <p className="text-white font-bold text-sm truncate">{newListingAlert.title}</p>
              <p className="text-slate-500 text-[10px] font-bold truncate">{newListingAlert.location} &middot; {newListingAlert.price}</p>
            </div>
            <button onClick={onDismissAlert} className="p-2 text-slate-600 hover:text-white transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-[480px] px-6 pt-6 flex flex-col gap-4 z-50">
        <div className="flex gap-4 items-center">
          {!isSidebarOpen && (
            <button 
              onClick={toggleSidebar}
              className="p-3 bg-[#1c1c21] rounded-2xl border border-white/5 text-white shadow-xl active:scale-90"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          )}
          <div className="flex-1 relative group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder={`Search ${activeCategory}...`}
              className={`w-full bg-[#1c1c21] border ${isParsing ? 'border-orange-500/50 animate-pulse' : 'border-white/5'} rounded-2xl px-12 py-3 text-sm focus:outline-none transition-all text-white placeholder:text-slate-600 shadow-xl`}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500">
              {isParsing ? (
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              )}
            </div>
            {searchQuery && (
               <button onClick={clearFilters} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
               </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center h-4">
          {aiFilters && (
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {aiFilters.location && <span className="px-2 py-0.5 bg-[#ff4d00]/10 border border-[#ff4d00]/20 text-[#ff4d00] rounded-full text-[8px] font-black uppercase tracking-widest">📍 {aiFilters.location}</span>}
              {aiFilters.maxPrice && <span className="px-2 py-0.5 bg-[#ff4d00]/10 border border-[#ff4d00]/20 text-[#ff4d00] rounded-full text-[8px] font-black uppercase tracking-widest">💰 Under €{aiFilters.maxPrice}</span>}
            </div>
          )}
          {isReranking && <span className="text-[8px] font-black text-orange-500 animate-pulse tracking-widest uppercase ml-auto">✨ AI Re-ranking Feed...</span>}
        </div>
      </div>

      <div className="flex-1 w-full max-w-[480px] relative flex items-center justify-center p-4 min-h-0">
        {currentListings.length === 0 ? (
          <div className="text-center py-20 px-8">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h3 className="text-xl font-black text-white mb-2 tracking-tight">No Matches Found</h3>
            <button onClick={clearFilters} className="mt-8 px-8 py-3 bg-[#ff4d00] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-orange-600/20">Reset Search</button>
          </div>
        ) : !activeListing ? (
          <div className="text-center py-20"><p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-700">Out of cards</p></div>
        ) : (
          <div className="relative w-full h-full max-h-[760px] aspect-[9/16]">
            <div className={`absolute inset-0 bg-[#16161a] rounded-[4rem] overflow-hidden shadow-2xl border border-white/5 transition-all duration-400 ease-out ${swipeDirection === 'like' ? 'translate-x-[150%] rotate-[20deg]' : ''} ${swipeDirection === 'nope' ? '-translate-x-[150%] -rotate-[20deg]' : ''}`}>
              <img src={activeListing.image} className="w-full h-full object-cover pointer-events-none select-none" alt={activeListing.title} />
              <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-10 transition-all duration-500 ${isDetailExpanded ? 'h-full bg-black/90 overflow-y-auto pt-24' : ''}`}>
                {isDetailExpanded && (
                  <button onClick={() => setIsDetailExpanded(false)} className="absolute top-10 right-10 p-3 bg-white/10 rounded-full text-white backdrop-blur-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
                )}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                       <h2 className="text-4xl font-black text-white tracking-tighter leading-none">{activeListing.title}</h2>
                       {rankedIds.includes(activeListing.id) && <span className="text-[8px] font-black text-[#ff4d00] uppercase tracking-widest mt-1">✨ AI Recommended</span>}
                    </div>
                    <div className="px-4 py-1.5 bg-[#ff4d00] rounded-2xl text-[11px] font-black text-white shadow-xl shadow-orange-600/20">{activeListing.price}</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black tracking-widest uppercase mb-4 opacity-90">
                    <svg className="w-3.5 h-3.5 text-[#ff4d00]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
                    {activeListing.location}
                  </div>
                  <p className={`text-slate-300 text-sm leading-relaxed mb-6 font-medium ${isDetailExpanded ? '' : 'line-clamp-2'}`}>{activeListing.description}</p>
                  {isDetailExpanded && renderCategoryFields(activeListing)}
                  {!isDetailExpanded && <button onClick={() => setIsDetailExpanded(true)} className="text-[11px] font-black text-[#ff4d00] uppercase tracking-[0.2em] hover:text-white transition-all">VIEW FULL DETAILS</button>}
                </div>

                {!isDetailExpanded && (
                  <div className="flex items-center justify-center gap-3 mt-6 pb-2">
                    <button onClick={() => handleSwipe('nope')} className="w-14 h-14 bg-white/10 border border-white/5 rounded-full flex items-center justify-center text-red-500 active:scale-90 transition-all shadow-xl backdrop-blur-md">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                    
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl">
                        <button onClick={onChatClick} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-blue-400 hover:text-white transition-all active:scale-90">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                        </button>
                        
                        <button 
                          onClick={handleReturn} 
                          disabled={lastSwipedIndex === null || hasReturnedThisTurn}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${lastSwipedIndex !== null && !hasReturnedThisTurn ? 'bg-white/10 text-amber-400' : 'bg-transparent text-slate-700 opacity-30 cursor-not-allowed'}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                        </button>

                        <button onClick={handleShare} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-emerald-400 hover:text-white transition-all active:scale-90">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                        </button>
                    </div>

                    <button onClick={() => handleSwipe('like')} className="w-18 h-18 bg-[#ff4d00] rounded-full flex items-center justify-center text-white active:scale-90 transition-all shadow-2xl shadow-orange-600/40">
                      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2C12,2,12,4,10,6C8,8,6.5,10.5,6.5,13.5C6.5,17.1,9.4,20,13,20C16.6,20,19.5,17.1,19.5,13.5C19.5,11.1,18.4,8.9,16,7.5C16.6,8.6,16.8,9.7,16.8,11.1C16.8,12.6,16.1,13.8,15.1,14.7C14.3,15.4,13.5,16,12.5,16.2V11C12.5,10,12.8,9.1,13.4,8.4C12.1,9.2,11.5,10.5,11.5,12V2Z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-[480px] px-8 py-6 flex items-center justify-center z-50">
        <div className="flex bg-[#1c1c21] rounded-full p-1.5 border border-white/5 shadow-2xl">
          <button onClick={onChatClick} className="px-10 py-3 bg-[#2a2a32] text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95">Concierge Lab</button>
        </div>
      </div>
      <div className="h-4 flex-shrink-0" />
    </div>
  );
};

export default ClientView;
