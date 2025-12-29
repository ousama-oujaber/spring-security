
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Icons } from './constants';
import { DOCS_DATA } from './data/docs';
import CodeBlock from './components/CodeBlock';
import AIAssistant from './components/AIAssistant';
import MermaidDiagram from './components/MermaidDiagram';

const App: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState('intro');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set(['intro']));
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  // Theme synchronization
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Scroll Progress and Intersection Observer
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = totalScroll / windowHeight;
      setScrollProgress(scroll * 100);
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          setVisibleSections((prev) => new Set(prev).add(id));
          setActiveSectionId(id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = document.querySelectorAll('section[id], header[id]');
    sections.forEach((section) => observer.observe(section));

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [activeSectionId]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return DOCS_DATA;
    const query = searchQuery.toLowerCase();
    return DOCS_DATA.filter(section => {
      const matchTitle = section.title.toLowerCase().includes(query);
      const matchContent = section.content.toLowerCase().includes(query);
      const matchSubs = section.subSections?.some(sub => 
        sub.title.toLowerCase().includes(query) || sub.content.toLowerCase().includes(query)
      );
      return matchTitle || matchContent || matchSubs;
    });
  }, [searchQuery]);

  const activeSectionData = useMemo(() => {
    return DOCS_DATA.find(s => 
      s.id === activeSectionId || (s.subSections && s.subSections.some(sub => sub.id === activeSectionId))
    );
  }, [activeSectionId]);

  const handleSectionChange = (sectionId: string) => {
    if (sectionId === activeSectionId) return;
    setIsMobileMenuOpen(false);
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setActiveSectionId(sectionId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-slate-900 dark:text-white font-bold tracking-tight">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono text-[0.85em] font-semibold border border-slate-100 dark:border-slate-700">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('[') && part.includes('](')) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <a 
              key={i} 
              href={match[2]} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-all"
            >
              {match[1]}
            </a>
          );
        }
      }
      return part;
    });
  };

  const renderSectionContent = (content: string) => {
    const parts = content.split('```');
    return parts.map((part, i) => {
      if (i % 2 === 0) {
        return part.split('\n').map((line, lidx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lidx} className="h-4" />;
          
          if (trimmed.startsWith('###')) {
            return <h3 key={lidx} className="text-xl font-bold text-slate-900 dark:text-white mt-12 mb-6 tracking-tight uppercase text-[12px] opacity-70">{trimmed.replace(/^###\s*/, '')}</h3>;
          }
          
          const isChecklist = trimmed.match(/^-\s*\[([ xX])\]/);
          if (isChecklist) {
            const isChecked = isChecklist[1].toLowerCase() === 'x';
            const itemContent = trimmed.replace(/^-\s*\[([ xX])\]\s*/, '');
            return (
              <div key={`${i}-${lidx}`} className="flex gap-4 items-center mb-6 pl-4 py-2 border-l-2 border-emerald-100 dark:border-emerald-900 group/check">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${isChecked ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20 rotate-3' : 'border-slate-200 dark:border-slate-700 group-hover/check:border-emerald-500/50'}`}>
                  {isChecked && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
                <span className={`text-lg font-medium transition-colors ${isChecked ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                  {formatText(itemContent)}
                </span>
              </div>
            );
          }

          const isBullet = trimmed.startsWith('-');
          return (
            <div key={`${i}-${lidx}`} className={`leading-relaxed ${isBullet ? 'flex gap-3 pl-4 py-2 border-l-2 border-emerald-100 dark:border-emerald-900 mb-4' : 'mb-8'}`}>
              {isBullet && <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
              <span className="text-slate-600 dark:text-slate-400 text-lg">{formatText(isBullet ? trimmed.substring(1).trim() : line)}</span>
            </div>
          );
        });
      } else {
        const lines = part.trim().split('\n');
        const lang = lines[0].trim();
        const code = lines.slice(1).join('\n');
        
        if (lang === 'mermaid') {
          return <MermaidDiagram key={i} chart={code} theme={theme} />;
        }
        
        return <CodeBlock key={i} code={code} language={lang || 'java'} />;
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-slate-50 dark:bg-slate-900">
        <div 
          className="h-full bg-emerald-500 transition-all duration-150" 
          style={{ width: `${scrollProgress}%` }} 
        />
      </div>

      {/* Sidebar Desktop */}
      <aside className="w-80 border-r border-slate-100 dark:border-slate-800 h-screen sticky top-0 flex flex-col hidden lg:flex z-50 bg-[#FCFDFF] dark:bg-[#0F172A] transition-colors duration-300">
        <div className="p-10 pb-8 shrink-0">
          <div className="flex items-center gap-3 mb-6 cursor-pointer group" onClick={() => handleSectionChange('intro')}>
            <div className="p-2.5 bg-slate-900 dark:bg-emerald-600 rounded-xl text-white shadow-lg transition-transform group-hover:scale-105">
              <Icons.Shield />
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight leading-none">Spring Guard</h2>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-[0.2em] mt-1.5">Ecosystem Guide</p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Icons.Search />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guide..." 
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-1.5 custom-scrollbar">
          {filteredDocs.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No modules found</p>
            </div>
          ) : (
            filteredDocs.map(section => {
              const isActiveParent = activeSectionData?.id === section.id;
              return (
                <div key={section.id} className="mb-6">
                  <button 
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all flex items-center justify-between group ${
                      isActiveParent 
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate">{section.title}</span>
                    {isActiveParent && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
                  </button>
                  
                  {section.subSections && (
                    <div className={`mt-1.5 ml-5 space-y-0.5 border-l-2 border-slate-50 dark:border-slate-800 overflow-hidden transition-all duration-300 ${isActiveParent ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
                      {section.subSections.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => handleSectionChange(sub.id)}
                          className={`w-full text-left px-5 py-2 text-[11px] font-semibold transition-all relative truncate ${
                            activeSectionId === sub.id
                              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                          }`}
                        >
                          {activeSectionId === sub.id && (
                            <div className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-[2px] h-3 bg-emerald-500 rounded-full" />
                          )}
                          {sub.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        <div className="p-8 border-t border-slate-50 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Version 6.4.x</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm"
              >
                {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Icons.Settings />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-white dark:bg-[#0B0F1A] transition-colors duration-300">
        {/* Mobile Header */}
        <header className="lg:hidden glass dark:bg-slate-950/70 border-b border-slate-100 dark:border-slate-800 p-4 sticky top-0 z-50 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => handleSectionChange('intro')}>
            <Icons.Shield />
            <span className="font-bold text-slate-900 dark:text-white">Spring Guard</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-slate-900 dark:bg-emerald-600 text-white rounded-lg shadow-lg active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
          </div>
        </header>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Modules</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredDocs.map(section => (
                  <button 
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)} 
                    className={`w-full text-left p-4 rounded-xl text-sm font-bold ${activeSectionId === section.id ? 'bg-slate-900 dark:bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-6 py-16 lg:px-20 lg:py-24">
          {filteredDocs.map((section) => (
            <div key={section.id} className="mb-48 last:mb-0">
              <header id={section.id} className={`mb-24 transition-all duration-1000 transform ${visibleSections.has(section.id) ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Security Protocol {section.id.toUpperCase()}
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-10 transition-colors duration-300">
                  {section.title}
                </h1>
                <div className="prose prose-xl prose-slate dark:prose-invert max-w-4xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {renderSectionContent(section.content)}
                </div>
              </header>

              {section.subSections && (
                <div className="grid gap-24">
                  {section.subSections.map(sub => (
                    <section 
                      key={sub.id} 
                      id={sub.id} 
                      className={`relative group scroll-mt-24 transition-all duration-1000 transform ${visibleSections.has(sub.id) ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all duration-300 ${activeSectionId === sub.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 rotate-3' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`}>
                          {sub.id.substring(0, 2).toUpperCase()}
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                          {sub.title}
                        </h2>
                      </div>

                      <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 sm:p-14 transition-all hover:shadow-2xl hover:shadow-emerald-900/5 group/card min-w-0">
                        <div className="relative min-w-0 overflow-hidden">
                          {renderSectionContent(sub.content)}
                        </div>
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className="border-t border-slate-50 dark:border-slate-800 mt-20 transition-colors duration-300">
          <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <Icons.Shield />
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">Spring Guard Project</span>
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-medium tracking-wide">© 2024 Built with precision for the modern Java ecosystem.</p>
            </div>
            <div className="flex gap-10 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">GitHub</a>
              <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Privacy</a>
            </div>
          </div>
        </footer>
      </main>

      <AIAssistant />
    </div>
  );
};

export default App;
