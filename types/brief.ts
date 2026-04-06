export type GenerationMode = 'internal' | 'stakeholder' | 'mvp';
export type GenerationPersona = 'CEO' | 'CTO' | 'PM';

export interface BriefData {
  summary: string;
  confidenceScore: number;
  businessProblem: string;
  goal: string;
  targetUser: string;
  proposedSolution: string;
  mvpScope: string[];
  outOfScope: string[];
  risks: string[];
  assumptions: string[];
  technicalApproach: string;
  mermaidDiagram: string;
  clarifyingQuestions: string[];
  stakeholderReply: string;
  missingInfo: string[];
  mode?: GenerationMode;
  persona?: GenerationPersona;
}

export const DEFAULT_BRIEF: BriefData = {
  summary: '',
  confidenceScore: 0,
  businessProblem: '',
  goal: '',
  targetUser: '',
  proposedSolution: '',
  mvpScope: [],
  outOfScope: [],
  risks: [],
  assumptions: [],
  technicalApproach: '',
  mermaidDiagram: '',
  clarifyingQuestions: [],
  stakeholderReply: '',
  missingInfo: []
};

export interface GenerateParams {
  rawInput: string;
  mode: GenerationMode;
  persona: GenerationPersona;
  compressToMvp: boolean;
  responseLanguage: 'en' | 'ru';
}
