
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { encodeBase64, decodeBase64, decodeAudioData } from '../services/geminiService';

interface VoiceViewProps {
  onBack?: () => void;
}

const VoiceView: React.FC<VoiceViewProps> = ({ onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcripts, setTranscripts] = useState<{ role: string; text: string }[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = () => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    setIsActive(false); setIsConnecting(false);
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false); setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encodeBase64(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then((session: any) => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor); scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decodeBase64(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer; source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.outputTranscription) setTranscripts(prev => [...prev, { role: 'Gemini', text: message.serverContent!.outputTranscription!.text }]);
            if (message.serverContent?.inputTranscription) setTranscripts(prev => [...prev, { role: 'You', text: message.serverContent!.inputTranscription!.text }]);
          },
          onclose: () => stopSession(),
          onerror: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          outputAudioTranscription: {}, inputAudioTranscription: {},
          systemInstruction: 'You are a natural conversation partner for the Swipess app.'
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (error) { setIsConnecting(false); }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#0a0a0c]">
      <header className="mb-10 flex items-center gap-6">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white active:scale-90 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">Gemini Live</h1>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">Vocal AI Handshake</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-12 max-w-2xl mx-auto w-full">
        <button
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-500 border-4 ${isActive ? 'bg-[#ff4d00]/10 border-[#ff4d00] shadow-[0_0_80px_rgba(255,77,0,0.3)] animate-pulse' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
        >
          {isActive ? <div className="text-white font-black text-xs tracking-widest uppercase">Live</div> : <div className="text-slate-600 font-black text-xs tracking-widest uppercase">Start Talk</div>}
        </button>

        <div className="w-full bg-[#16161a] border border-white/5 rounded-[3rem] p-8 h-64 overflow-y-auto custom-scrollbar flex flex-col gap-4">
          {transcripts.map((t, i) => (
            <div key={i} className={`text-sm ${t.role === 'You' ? 'text-[#ff4d00] font-black' : 'text-slate-300 font-medium'}`}>
              <span className="uppercase text-[9px] tracking-widest mr-2 opacity-50">{t.role}:</span> {t.text}
            </div>
          ))}
          {transcripts.length === 0 && <p className="text-center text-slate-700 text-xs font-black uppercase tracking-widest py-10">Waiting for interaction...</p>}
        </div>
      </div>
    </div>
  );
};

export default VoiceView;
