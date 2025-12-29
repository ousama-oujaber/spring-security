
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';
import { askGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm your specialized Spring Security consultant. I'm trained on the latest documentation and best practices. How can I help you secure your application today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await askGemini([...messages, userMsg]);
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {isOpen ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)] w-[calc(100vw-32px)] sm:w-[440px] h-[680px] flex flex-col border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 origin-bottom-right transition-colors duration-300">
          <div className="p-7 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Icons.Sparkles />
              </div>
              <div>
                <span className="font-bold text-sm block tracking-tight">Expert AI Agent</span>
                <span className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Now
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-slate-800 dark:hover:bg-slate-800 p-2.5 rounded-xl transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-8 bg-slate-50/30 dark:bg-slate-950/20 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-3xl text-[13px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl text-[13px] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 animate-pulse">
                   <div className="flex gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                   </div>
                   <span className="font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">Analyzing Security Flow...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about JWT, CORS, or OAuth2..."
                className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none text-sm font-medium transition-all text-slate-900 dark:text-white"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-40 disabled:grayscale text-white p-4 rounded-2xl transition-all shadow-xl shadow-slate-200 dark:shadow-none active:scale-95 flex items-center justify-center shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white px-7 py-5 rounded-[2rem] shadow-2xl transition-all hover:-translate-y-2 hover:scale-105 active:scale-95 flex items-center gap-4 group"
        >
          <div className="bg-emerald-500 dark:bg-white p-2 rounded-xl text-white dark:text-emerald-600 group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">
            <Icons.Sparkles />
          </div>
          <span className="font-bold text-sm tracking-tight">Security Consultant</span>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
