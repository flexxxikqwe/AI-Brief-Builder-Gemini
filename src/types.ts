export interface BriefData {
  summary: string;
  businessProblem: string;
  goal: string;
  targetUser: string;
  clarifyingQuestions: string[];
  proposedSolution: string;
  mvpScope: string[];
  outOfScope: string[];
  risks: string[];
  assumptions: string[];
  technicalApproach: string;
  taskDraft: string;
  stakeholderReply: string;
}

export type GenerationMode = 'internal' | 'stakeholder' | 'mvp';
