
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';

interface ImageGenViewProps {
  onBack?: () => void;
}

const ImageGenView: React.FC<ImageGenViewProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<{ url: string; prompt: string }[]>([]);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const imageUrl = await GeminiService.generateImage(prompt, aspectRatio);
      setImages(prev => [{ url: imageUrl, prompt }, ...prev]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full bg-[#0a0a0c] min-h-full">
      <header className="mb-10 flex items-center gap-6">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white active:scale-90 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">Visualizer Studio</h1>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">Generative Imaging Engine</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#16161a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Configuration</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Aspect Ratio</label>
                <div className="grid grid-cols-1 gap-2">
                  {(["1:1", "16:9", "9:16"] as const).map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-3 text-[10px] font-black rounded-xl border transition-all ${aspectRatio === ratio ? 'bg-[#ff4d00] border-[#ff4d00] text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'}`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#16161a] border border-white/5 p-8 rounded-[3rem] shadow-2xl">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the cinematic visual..."
              className="w-full bg-[#0a0a0c] border border-white/5 rounded-[2rem] p-6 min-h-[120px] focus:outline-none transition-all placeholder:text-slate-800 text-sm"
            />
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="px-10 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-xl"
              >
                {isLoading ? 'Processing...' : 'Generate Image'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {images.map((img, idx) => (
              <div key={idx} className="bg-[#16161a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img src={img.url} className="w-full aspect-square object-cover" />
                <div className="p-6">
                  <p className="text-[10px] text-slate-500 line-clamp-1 italic font-medium">{img.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenView;
