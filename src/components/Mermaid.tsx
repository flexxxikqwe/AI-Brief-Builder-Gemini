import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
});

interface MermaidProps {
  chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const isInitialRender = useRef(true);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart) return;
      
      try {
        setError(false);
        const isDark = document.documentElement.classList.contains('dark');
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'neutral',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
        });

        const id = `mermaid-svg-${Math.random().toString(36).substring(2, 11)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        setError(true);
      }
    };

    renderChart();
    
    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          renderChart();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [chart]);

  if (error) {
    return (
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
        <p className="text-zinc-400 dark:text-zinc-600 text-xs font-mono uppercase tracking-widest mb-2">Diagram Error</p>
        <p className="text-zinc-300 dark:text-zinc-700 text-[10px] leading-relaxed">
          Не удалось отобразить визуальную схему. <br/>
          Сырой код диаграммы:
        </p>
        <pre className="mt-3 p-3 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800 rounded-lg text-[9px] text-zinc-400 dark:text-zinc-600 overflow-x-auto text-left">
          {chart}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return <div className="h-32 animate-pulse bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800" />;
  }

  return (
    <div 
      className="mermaid-wrapper w-full overflow-x-auto py-8 bg-zinc-50/30 dark:bg-zinc-900/30 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
