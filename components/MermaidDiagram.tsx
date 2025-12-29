
import React, { useEffect, useRef } from 'react';

interface MermaidDiagramProps {
  chart: string;
  theme: 'light' | 'dark';
}

declare global {
  interface Window {
    mermaid: any;
  }
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, theme }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.mermaid) {
      const renderDiagram = async () => {
        if (!ref.current || !chart || !chart.trim()) {
          if (ref.current) ref.current.innerHTML = '';
          return;
        }
        
        // Configuration for mermaid
        window.mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'neutral',
          securityLevel: 'loose',
          fontFamily: 'Plus Jakarta Sans',
          themeVariables: {
            primaryColor: '#10b981',
            primaryTextColor: theme === 'dark' ? '#fff' : '#000',
            lineColor: theme === 'dark' ? '#334155' : '#e2e8f0',
          }
        });

        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await window.mermaid.render(id, chart.trim());
          ref.current.innerHTML = svg;
          
          // Force SVG to be responsive
          const svgElement = ref.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
          }
        } catch (error) {
          console.error('Mermaid render error:', error);
          ref.current.innerHTML = '<div class="text-red-500 p-4 text-xs font-mono">Failed to render architectural diagram.</div>';
        }
      };

      renderDiagram();
    }
  }, [chart, theme]);

  if (!chart || !chart.trim()) return null;

  return (
    <div className="my-10 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-x-hidden transition-colors duration-300 w-full max-w-full">
      <div ref={ref} className="mermaid flex justify-center w-full max-w-full overflow-hidden" />
    </div>
  );
};

export default MermaidDiagram;
