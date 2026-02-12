
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ClientView from './components/ClientView';
import OwnerView from './components/OwnerView';
import ChatView from './components/ChatView';
import ImageGenView from './components/ImageGenView';
import VideoGenView from './components/VideoGenView';
import VoiceView from './components/VoiceView';
import GithubRepoView from './components/GithubRepoView';
import ProfileView from './components/ProfileView';
import Auth from './components/Auth';
import ConnectionGuide from './components/ConnectionGuide';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { DashboardMode, ListingCategory, AppView } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>({
    user: {
      id: 'dev-user-123',
      email: 'developer@swipess.app',
      user_metadata: {
        full_name: 'Developer Mode',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
        bio: 'Building the future of marketplaces with AI.',
        phone: '+34 600 000 000',
        location: 'Madrid, Spain'
      }
    },
    isMock: true
  });
  
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<DashboardMode>(DashboardMode.CLIENT);
  const [activeView, setActiveView] = useState<AppView>(AppView.DISCOVERY);
  const [category, setCategory] = useState<ListingCategory>(ListingCategory.PROPERTY);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    supabase!.auth.getSession().then(({ data: { session: actualSession } }) => {
      if (actualSession) {
        setSession(actualSession);
        setShowAuth(false);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        setSession(newSession);
        setShowAuth(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const handleBack = () => {
    setActiveView(AppView.DISCOVERY);
    setMode(DashboardMode.CLIENT);
  };

  const renderContent = () => {
    if (activeView === AppView.PROFILE) {
      return <ProfileView user={session.user} onBack={handleBack} onUpdate={(newData) => setSession({...session, user: {...session.user, user_metadata: newData}})} />;
    }

    if (mode === DashboardMode.OWNER) {
      return <OwnerView onBack={handleBack} />;
    }

    switch (activeView) {
      case AppView.DISCOVERY:
        return (
          <ClientView 
            activeCategory={category} 
            setCategory={setCategory}
            isSidebarOpen={isSidebarOpen} 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onChatClick={() => setActiveView(AppView.CHAT)}
          />
        );
      case AppView.CHAT:
        return <ChatView onBack={handleBack} />;
      case AppView.IMAGE:
        return <ImageGenView onBack={handleBack} />;
      case AppView.VIDEO:
        return <VideoGenView onBack={handleBack} />;
      case AppView.VOICE:
        return <VoiceView onBack={handleBack} />;
      case AppView.GITHUB:
        return <GithubRepoView session={session} onBack={handleBack} />;
      default:
        return <ClientView activeCategory={category} setCategory={setCategory} isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onChatClick={() => setActiveView(AppView.CHAT)} />;
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a0c]">
      <div className="w-12 h-12 border-4 border-[#ff4d00] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!isConfigured) return <ConnectionGuide />;
  if (showAuth) return <Auth onBypass={() => setShowAuth(false)} />;

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] overflow-hidden text-slate-100 font-sans selection:bg-[#ff4d00] selection:text-white">
      <Sidebar 
        mode={mode} 
        setMode={(m) => { 
          setMode(m); 
          setActiveView(AppView.DISCOVERY);
          setIsSidebarOpen(false); 
        }} 
        activeView={activeView}
        setActiveView={(v) => { 
          setActiveView(v); 
          setIsSidebarOpen(false); 
        }}
        category={category}
        setCategory={(cat) => {
          setCategory(cat);
          setActiveView(AppView.DISCOVERY);
          setMode(DashboardMode.CLIENT);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        user={session.user}
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative bg-[#0f0f12] overflow-hidden">
        {/* Animated Background Pulse Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,77,0,0.08),_transparent_70%)] bg-pulse pointer-events-none" />
        
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-lg z-[60] lg:hidden animate-view-entry"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* View Transition Wrapper: Key forces re-mount for animation */}
        <div 
          key={`${mode}-${activeView}-${category}`} 
          className="flex-1 overflow-auto relative animate-view-entry h-full"
        >
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;