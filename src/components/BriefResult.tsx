import React, { useState } from 'react';
import { BriefData } from '../types';
import { Mermaid } from './Mermaid';
import { buildMarkdownFromBrief } from '../utils/markdown';
import { 
  CheckCircle2, AlertTriangle, Target, Users, Code, 
  MessageSquare, HelpCircle, ListTodo, ShieldAlert, 
  Lightbulb, FileText, Send, Copy, Check, GitBranch, Download
} from 'lucide-react';

interface BriefResultProps {
  data: Partial<BriefData>;
}

export const BriefResult: React.FC<BriefResultProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  if (!data.summary) return null;

  const handleCopyMarkdown = () => {
    const md = buildMarkdownFromBrief(data);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = buildMarkdownFromBrief(data);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = `ai-brief-${(data.summary || 'project').toLowerCase().replace(/\s+/g, '-')}.md`;
    
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const Section = ({ title, icon: Icon, children, className = "" }: any) => (
    <section className={`bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 ${className}`}>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        {title}
      </h3>
      <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
        {children}
      </div>
    </section>
  );

  const List = ({ items }: { items?: string[] }) => (
    <ul className="space-y-2">
      {items?.map((item, i) => (
        <li key={i} className="flex gap-2 items-start">
          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-600 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          Analysis Result
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${
              copied 
                ? 'bg-emerald-500 text-white shadow-emerald-100' 
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-600 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-600 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Confidence & Missing Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Subtle background glow for low confidence */}
          {(data.confidenceScore || 0) < 60 && (
            <div className="absolute inset-0 bg-amber-50/30 dark:bg-amber-950/10 animate-pulse" />
          )}
          
          <div className="relative w-20 h-20 flex items-center justify-center mb-3 z-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-zinc-100 dark:text-zinc-800"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={226}
                strokeDashoffset={226 - (226 * (data.confidenceScore || 50)) / 100}
                className={`${(data.confidenceScore || 0) < 60 ? 'text-amber-500' : 'text-indigo-600 dark:text-indigo-400'} transition-all duration-1000`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 leading-none">{data.confidenceScore}%</span>
              {(data.confidenceScore || 0) < 60 && <AlertTriangle className="w-3 h-3 text-amber-500 mt-1" />}
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 z-10">AI Confidence</p>
        </div>

        {data.missingInfo && data.missingInfo.length > 0 && (
          <Section 
            title="What’s missing for a stronger brief" 
            icon={HelpCircle} 
            className="md:col-span-2 border-l-4 border-l-amber-400 bg-amber-50/20 dark:bg-amber-950/10"
          >
            <List items={data.missingInfo} />
          </Section>
        )}
      </div>

      {/* Primary Summary */}
      <Section title="Summary" icon={Target} className="border-l-4 border-l-indigo-600 dark:border-l-indigo-400">
        <p className="text-lg text-zinc-800 dark:text-zinc-200 font-medium">{data.summary}</p>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Business Problem" icon={AlertTriangle}>
          {data.businessProblem}
        </Section>
        <Section title="Goal" icon={CheckCircle2}>
          {data.goal}
        </Section>
        <Section title="Target User" icon={Users}>
          {data.targetUser}
        </Section>
        <Section title="Proposed Solution" icon={Lightbulb}>
          {data.proposedSolution}
        </Section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="MVP Scope" icon={ListTodo}>
          <List items={data.mvpScope} />
        </Section>
        <Section title="Out of Scope" icon={ShieldAlert}>
          <List items={data.outOfScope} />
        </Section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Risks" icon={ShieldAlert}>
          <List items={data.risks} />
        </Section>
        <Section title="Assumptions" icon={FileText}>
          <List items={data.assumptions} />
        </Section>
      </div>

      <Section title="Clarifying Questions" icon={HelpCircle}>
        <List items={data.clarifyingQuestions} />
      </Section>

      {data.mermaidDiagram && (
        <Section title="Visual Architecture" icon={GitBranch}>
          <Mermaid chart={data.mermaidDiagram} />
        </Section>
      )}

      <Section title="Technical Approach" icon={Code}>
        <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-xl font-mono text-xs border border-zinc-100 dark:border-zinc-800">
          {data.technicalApproach}
        </div>
      </Section>

      <Section title="Task Draft (Jira/Linear)" icon={FileText}>
        <div className="bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-100 dark:border-zinc-800">
          <pre className="whitespace-pre-wrap">{data.taskDraft}</pre>
        </div>
      </Section>

      <Section title="Stakeholder Reply" icon={Send} className="bg-indigo-50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/30">
        <div className="italic text-indigo-900 dark:text-indigo-300 bg-white/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
          {data.stakeholderReply}
        </div>
      </Section>
    </div>
  );
};
