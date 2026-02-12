
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService, decodeAudioData, decodeBase64 } from '../services/geminiService';
import { Message } from '../types';

interface ChatViewProps {
  onBack?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hello! I am your Swipess Copilot. Need help finding a match or building a listing?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await GeminiService.chat(input, history);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response || 'Sorry, I couldn\'t generate a response.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (msgId: string, text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(msgId);
    try {
      const base64Audio = await GeminiService.generateSpeech(text);
      if (base64Audio) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(null);
        source.start();
      }
    } catch (err) {
      console.error(err);
      setIsSpeaking(null);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-4 py-8 bg-[#0a0a0c]">
      <header className="mb-10 flex items-center gap-6">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white active:scale-90 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#ff4d00] to-amber-500 tracking-tight leading-none">AI Concierge</h1>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">Real-time Gemini Engine</p>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pb-24 pr-2 custom-scrollbar"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-6 py-4 rounded-[2.5rem] ${msg.role === 'user' ? 'bg-[#ff4d00] text-white rounded-tr-none' : 'bg-[#1c1c21] text-slate-200 border border-white/5 rounded-tl-none'} relative group shadow-xl`}>
              <div className="text-sm leading-relaxed">{msg.text}</div>
              {msg.role === 'model' && (
                <button onClick={() => handleSpeak(msg.id, msg.text)} disabled={isSpeaking === msg.id} className="absolute -right-12 top-2 p-2.5 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-[#ff4d00]" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="p-4 bg-white/5 rounded-2xl w-fit animate-pulse text-xs text-slate-600 font-black uppercase tracking-widest">Thinking...</div>}
      </div>

      <div className="sticky bottom-0 left-0 right-0 pt-6 pb-2">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Type your request..."
            className="w-full bg-[#1c1c21] border border-white/5 rounded-[2.5rem] px-8 py-5 pr-16 focus:outline-none transition-all placeholder:text-slate-700 shadow-2xl resize-none"
            rows={1}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="absolute right-4 bottom-4 p-3 bg-[#ff4d00] text-white rounded-2xl hover:opacity-90 active:scale-90 transition-all">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
