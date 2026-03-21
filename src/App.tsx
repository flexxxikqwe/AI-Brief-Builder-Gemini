import { useState, useEffect } from 'react';
import { BriefForm } from './components/BriefForm';
import { BriefResult } from './components/BriefResult';
import { BriefData, GenerationMode } from './types';
import { Sparkles, Terminal, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [brief, setBrief] = useState<Partial<BriefData> | null>(null);
  const [health, setHealth] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data.status))
      .catch(() => setHealth('Error'));
  }, []);

  const handleGenerate = async (rawInput: string, mode: GenerationMode, compressToMvp: boolean) => {
    setIsLoading(true);
    setError(null);
    setBrief(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput, mode, compressToMvp }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Произошла ошибка при анализе запроса.');
      }

      setBrief(data);
      // Скролл к результату
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Failed to generate:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBrief(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#EEF2FF_0%,transparent_70%)] -z-10" />
        
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">AI-Powered R&D Tool</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-zinc-900 leading-[0.9]"
          >
            Преврати хаос в <br />
            <span className="text-indigo-600">готовый продукт</span>.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed"
          >
            Инструмент для AI Product Builder'ов. Вставьте сырые мысли — получите структурированное ТЗ, MVP-план и ответ стейкхолдерам за секунды.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 text-[10px] font-mono text-zinc-400"
          >
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${health === 'ok' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            SYSTEM STATUS: {health.toUpperCase()}
          </motion.div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 pb-32 space-y-16">
        {/* Form Section */}
        <section className="relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
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
              className="bg-rose-50 border border-rose-100 p-5 rounded-3xl flex items-center gap-4 text-rose-600 shadow-sm"
            >
              <div className="bg-rose-100 p-2 rounded-xl">
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
                  <div className="w-24 h-24 border-4 border-indigo-600/5 border-t-indigo-600 rounded-full animate-spin" />
                  <Sparkles className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center space-y-3">
                  <p className="text-zinc-900 font-black uppercase tracking-[0.3em] text-[10px]">Thinking Strategy</p>
                  <p className="text-zinc-400 text-sm font-medium">Выделяем MVP, оцениваем риски и пишем ТЗ...</p>
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
                className="py-32 text-center border-2 border-dashed border-zinc-100 rounded-[48px] bg-zinc-50/30"
              >
                <div className="bg-white w-16 h-16 rounded-3xl shadow-sm border border-zinc-100 flex items-center justify-center mx-auto mb-6">
                  <Terminal className="w-6 h-6 text-zinc-300" />
                </div>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Waiting for your idea</p>
                <p className="text-zinc-300 text-xs mt-3 max-w-xs mx-auto leading-relaxed">
                  Результат анализа появится здесь. Мы разложим ваш запрос на 13 структурных блоков.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-16 border-t border-zinc-50 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Brief Builder</span>
          </div>
          <p className="text-[9px] text-zinc-300 uppercase tracking-[0.4em] font-bold leading-loose">
            Built for AI/R&D Builder Test Task • Pragmatic MVP Approach • 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
