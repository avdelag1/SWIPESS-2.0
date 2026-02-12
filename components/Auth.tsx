
import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail } from '../services/supabaseClient';

interface AuthProps {
  onBypass: () => void;
}

const Auth: React.FC<AuthProps> = ({ onBypass }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        alert('Check your email for the confirmation link!');
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-6 relative overflow-hidden">
      {/* Immersive Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ff4d00]/15 rounded-full blur-[160px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[160px] animate-pulse delay-1000"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-[#16161a]/80 border border-white/10 rounded-[3.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] backdrop-blur-3xl transition-all duration-500">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#ff4d00] to-[#ffb700] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/40 mb-6 transform hover:scale-105 transition-transform duration-500">
               <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.5,2C11.5,2,11.5,4,9.5,6C7.5,8,6,10.5,6,13.5C6,17.1,8.9,20,12.5,20C16.1,20,19,17.1,19,13.5C19,11.1,17.9,8.9,16,7.5C16.6,8.6,16.8,9.7,16.8,11.1C16.8,12.6,16.1,13.8,15.1,14.7C14.3,15.4,13.5,16,12.5,16.2V11C12.5,10,12.8,9.1,13.4,8.4C12.1,9.2,11.5,10.5,11.5,12V2Z" />
                <text x="8.5" y="16.5" className="font-black text-[7px]" fill="white" style={{ fontFamily: 'Inter, sans-serif' }}>S</text>
              </svg>
            </div>
            <h1 className="text-3xl font-black mb-2 text-white tracking-tight">Swipess</h1>
            <p className="text-slate-400 text-sm font-medium">
              {isSignUp ? 'Create your discovery account' : 'Welcome back to the marketplace'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400 text-center font-bold">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-slate-700"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-slate-100 transition-all active:scale-[0.98] shadow-xl mt-4 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'
              )}
            </button>

            <div className="flex flex-col gap-4 mt-6">
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[11px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
              
              <div className="h-px bg-white/5 w-full my-2"></div>
              
              <button 
                type="button"
                onClick={onBypass}
                className="text-[11px] font-black text-orange-500 hover:text-orange-400 transition-colors uppercase tracking-[0.2em]"
              >
                Skip to Dashboard (Developer Mode)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
