
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';

interface VideoGenViewProps {
  onBack?: () => void;
}

const VideoGenView: React.FC<VideoGenViewProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<{ url: string; prompt: string }[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const videoUrl = await GeminiService.generateVideo(prompt);
      setVideos(prev => [{ url: videoUrl, prompt }, ...prev]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full bg-[#0a0a0c] min-h-full">
      <header className="mb-10 flex items-center gap-6">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white active:scale-90 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">Video Lab</h1>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">AI temporal synthesis</p>
        </div>
      </header>

      <div className="bg-[#16161a] border border-white/5 p-10 rounded-[3.5rem] mb-12 shadow-2xl">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Temporal prompt for cinematic motion..."
          className="w-full bg-[#0a0a0c] border border-white/5 rounded-[2rem] p-8 min-h-[140px] focus:outline-none transition-all placeholder:text-slate-800 text-sm"
        />
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="px-12 py-5 bg-[#ff4d00] text-white font-black rounded-3xl hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-orange-600/20 text-[10px] uppercase tracking-widest"
          >
            {isLoading ? 'Rendering...' : 'Produce Video'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {videos.map((vid, idx) => (
          <div key={idx} className="bg-[#16161a] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
            <video src={vid.url} controls className="w-full aspect-video object-contain bg-black" />
            <div className="p-6">
              <p className="text-[10px] text-slate-500 font-medium line-clamp-2">{vid.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGenView;
