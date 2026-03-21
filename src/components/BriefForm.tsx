import React, { useState } from 'react';
import { GenerationMode } from '../types';
import { Zap, Layout, Users, Target, RotateCcw, Lightbulb, MousePointer2 } from 'lucide-react';

interface BriefFormProps {
  onSubmit: (rawInput: string, mode: GenerationMode, compressToMvp: boolean) => void;
  onReset: () => void;
  isLoading: boolean;
}

const DEMO_EXAMPLES = [
  {
    id: 'general',
    label: 'Общий',
    text: "Хочу сделать что-то вроде соцсети для домашних животных, где они могут общаться и находить друзей поблизости."
  },
  {
    id: 'medium',
    label: 'Конкретный',
    text: "Нужен сервис для бронирования переговорных комнат в офисе. С интеграцией в Google Calendar, пуш-уведомлениями за 5 минут до начала и QR-кодами на дверях."
  },
  {
    id: 'internal',
    label: 'Команде',
    text: "Команда, нам нужно ускорить деплой. Сейчас это занимает 40 минут. Хочу пайплайн, который сам прогоняет тесты и деплоит в стейджинг при мерже в dev."
  },
  {
    id: 'client',
    label: 'Заказчик',
    text: "Уважаемые разработчики, мы хотим обновить наш сайт. Сейчас он старый. Нужно чтобы было красиво, быстро, работало на мобилках и была форма обратной связи."
  },
  {
    id: 'ecommerce',
    label: 'E-com AI',
    text: "Хотим внедрить AI-рекомендации в наш интернет-магазин одежды. Чтобы система анализировала прошлые покупки и предлагала аксессуары к выбранному товару."
  }
];

export const BriefForm: React.FC<BriefFormProps> = ({ onSubmit, onReset, isLoading }) => {
  const [rawInput, setRawInput] = useState('');
  const [mode, setMode] = useState<GenerationMode>('internal');
  const [compressToMvp, setCompressToMvp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawInput.trim().length >= 10) {
      onSubmit(rawInput, mode, compressToMvp);
    }
  };

  const handleReset = () => {
    setRawInput('');
    setMode('internal');
    setCompressToMvp(false);
    onReset();
  };

  const fillExample = (text: string) => {
    setRawInput(text);
  };

  return (
    <div className="space-y-6">
      {/* Demo Examples Block */}
      <div className="bg-indigo-50/50 p-5 rounded-[32px] border border-indigo-100/50">
        <div className="flex items-center gap-2 mb-4">
          <MousePointer2 className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Try Example</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => fillExample(ex.text)}
              className="px-4 py-2 bg-white border border-indigo-100 rounded-full text-[10px] font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-zinc-100 transition-all hover:shadow-md">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Сырой запрос / Идея
            </label>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              Вставьте хаос
            </div>
          </div>
          <textarea
            className="w-full h-48 p-5 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none text-zinc-600 bg-zinc-50/30 leading-relaxed"
            placeholder="Опишите вашу идею, вставьте сообщение из мессенджера или хаотичное ТЗ от заказчика..."
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            disabled={isLoading}
          />
          <div className="mt-3 flex justify-between items-center">
             <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
              {rawInput.length < 10 ? `Минимум 10 символов • ${rawInput.length}` : `${rawInput.length} символов`}
            </p>
            {rawInput.length > 0 && (
              <button 
                type="button" 
                onClick={handleReset}
                className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1 hover:text-rose-600"
              >
                <RotateCcw className="w-3 h-3" /> Сбросить
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
              Режим анализа
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'internal', icon: Layout, label: 'Команда', desc: 'Для ТЗ' },
                { id: 'stakeholder', icon: Users, label: 'Бизнес', desc: 'Для ответа' },
                { id: 'mvp', icon: Zap, label: 'MVP', desc: 'Для релиза' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id as GenerationMode)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    mode === m.id 
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' 
                      : 'border-zinc-100 bg-white text-zinc-400 hover:border-zinc-200'
                  }`}
                >
                  <m.icon className="w-5 h-5 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <label className="flex items-center gap-4 cursor-pointer group p-3 rounded-2xl border border-transparent hover:border-zinc-100 transition-all">
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={compressToMvp}
                  onChange={(e) => setCompressToMvp(e.target.checked)}
                  disabled={isLoading}
                />
                <div className="w-12 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-zinc-700">Сжать до MVP</span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Агрессивный scope reduction</span>
              </div>
            </label>

            <button
              type="submit"
              disabled={isLoading || rawInput.trim().length < 10}
              className={`w-full py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-xl ${
                isLoading || rawInput.trim().length < 10
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 hover:shadow-indigo-200 active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Анализируем...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Разобрать запрос
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
