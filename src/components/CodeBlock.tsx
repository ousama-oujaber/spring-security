
import React, { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'java' }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      // Clean previous highlight if any
      codeRef.current.removeAttribute('data-highlighted');
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Map common documentation labels to highlight.js compatible language classes
  const getLangClass = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === 'yaml' || l === 'yml') return 'language-yaml';
    if (l === 'xml' || l === 'pom.xml') return 'language-xml';
    if (l === 'groovy' || l === 'gradle') return 'language-groovy';
    if (l === 'bash' || l === 'shell') return 'language-bash';
    return `language-${l}`;
  };

  return (
    <div className="relative group my-10 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#0d1117] shadow-2xl transition-all hover:ring-2 hover:ring-emerald-500/30 w-full max-w-full">
      <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 select-none">{language}</span>
        </div>
        <button 
          onClick={copyToClipboard}
          className={`text-[10px] font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 tracking-widest uppercase border ${
            copied 
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105' 
              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 hover:border-slate-600'
          }`}
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div className="relative w-full overflow-hidden">
        <pre className="p-8 text-[14px] leading-relaxed code-font overflow-x-auto text-slate-300 custom-scrollbar whitespace-pre-wrap break-words w-full max-w-full">
          <code ref={codeRef} className={`${getLangClass(language)} block w-full`}>
            {code}
          </code>
        </pre>
        {/* Aesthetic decoration */}
        <div className="absolute right-6 top-6 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;
