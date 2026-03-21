import { useState, useEffect } from 'react';
import { BriefForm } from './components/BriefForm';
import { BriefResult } from './components/BriefResult';
import { BriefData, GenerationMode, GenerationPersona, Theme } from './types';
import { Sparkles, Terminal, AlertCircle, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateBrief } from './services/gemini';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [brief, setBrief] = useState<Partial<BriefData> | null>(null);
  const [health, setHealth] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [hasManualChoice, setHasManualChoice] = useState(() => !!localStorage.getItem('theme'));

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data.status))
      .catch(() => setHealth('Error'));
  }, []);

  useEffect(() => {
    if (hasManualChoice) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [hasManualChoice]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      setHasManualChoice(true);
      return next;
    });
  };

  const handleGenerate = async (rawInput: string, mode: GenerationMode, persona: GenerationPersona, compressToMvp: boolean) => {
    setIsLoading(true);
    setError(null);
    setBrief(null);
    
    try {
      const result = await generateBrief(rawInput, mode, persona, compressToMvp);
      setBrief(result);
      
      // Скролл к результату
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Failed to generate:', err);
      setError(err.message || 'Произошла ошибка при анализе запроса.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBrief(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-100 transition-colors duration-500">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#EEF2FF_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b_0%,transparent_70%)] -z-10" />
        
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Top Actions Area */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/30 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">AI-Powered R&D Tool</span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </motion.button>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-zinc-900 dark:text-white leading-[0.9]"
          >
            Преврати хаос в <br />
            <span className="text-indigo-600 dark:text-indigo-400">готовый продукт</span>.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Инструмент для AI Product Builder'ов. Вставьте сырые мысли — получите структурированное ТЗ, MVP-план и ответ стейкхолдерам за секунды.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 text-[10px] font-mono text-zinc-400 dark:text-zinc-500"
          >
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${health === 'ok' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            SYSTEM STATUS: {health.toUpperCase()}
          </motion.div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 pb-32 space-y-16">
        {/* Form Section */}
        <section className="relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Input Area <ArrowRight className="w-3 h-3" />
          </div>
          <BriefForm onSubmit={handleGenerate} onReset={handleReset} isLoading={isLoading} />
        </section>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-5 rounded-3xl flex items-center gap-4 text-rose-600 dark:text-rose-400 shadow-sm"
            >
              <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-xl">
                <AlertCircle className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1">Ошибка анализа</p>
                <p className="text-sm font-medium opacity-80">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Section */}
        <section id="result-section" className="scroll-mt-12">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 space-y-8"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-indigo-600/5 dark:border-indigo-400/5 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
                  <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center space-y-3">
                  <p className="text-zinc-900 dark:text-zinc-100 font-black uppercase tracking-[0.3em] text-[10px]">Thinking Strategy</p>
                  <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">Выделяем MVP, оцениваем риски и пишем ТЗ...</p>
                </div>
              </motion.div>
            ) : brief ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20 }}
              >
                <BriefResult data={brief} />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[48px] bg-zinc-50/30 dark:bg-zinc-900/10"
              >
                <div className="bg-white dark:bg-zinc-900 w-16 h-16 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mx-auto mb-6">
                  <Terminal className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                </div>
                <p className="text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Waiting for your idea</p>
                <p className="text-zinc-300 dark:text-zinc-700 text-xs mt-3 max-w-xs mx-auto leading-relaxed">
                  Результат анализа появится здесь. Мы разложим ваш запрос на 13 структурных блоков.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-16 border-t border-zinc-50 dark:border-zinc-900 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] dark:text-zinc-400">Brief Builder</span>
          </div>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.4em] font-bold leading-loose">
            Built for AI/R&D Builder Test Task • Pragmatic MVP Approach • 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
