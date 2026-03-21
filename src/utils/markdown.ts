import { BriefData } from '../types';

export const buildMarkdownFromBrief = (data: Partial<BriefData>): string => {
  const sections: string[] = [];

  // Title
  sections.push(`# AI PROJECT BRIEF: ${data.summary || 'Untitled Project'}`);
  sections.push(`*Generated on ${new Date().toLocaleDateString()}*`);
  sections.push('');

  const addSection = (title: string, content: string | string[] | undefined) => {
    if (!content) return;
    if (Array.isArray(content) && content.length === 0) return;

    sections.push(`## ${title}`);
    if (Array.isArray(content)) {
      content.forEach(item => sections.push(`- ${item}`));
    } else {
      sections.push(content);
    }
    sections.push('');
  };

  addSection('🎯 Goal', data.goal);
  addSection('⚠️ Business Problem', data.businessProblem);
  addSection('👥 Target User', data.targetUser);
  addSection('💡 Proposed Solution', data.proposedSolution);
  
  if (data.mermaidDiagram) {
    sections.push('## 📊 Visual Architecture');
    sections.push('```mermaid');
    sections.push(data.mermaidDiagram);
    sections.push('```');
    sections.push('');
  }

  addSection('🛠 MVP Scope', data.mvpScope);
  addSection('🚫 Out of Scope', data.outOfScope);
  addSection('🚩 Risks', data.risks);
  addSection('📝 Assumptions', data.assumptions);
  addSection('❓ Clarifying Questions', data.clarifyingQuestions);
  addSection('🏗 Technical Approach', data.technicalApproach);
  
  if (data.taskDraft) {
    sections.push('## 📋 Task Draft (Jira/Linear)');
    sections.push('```text');
    sections.push(data.taskDraft);
    sections.push('```');
    sections.push('');
  }

  addSection('✉️ Stakeholder Reply', data.stakeholderReply);

  if (data.confidenceScore !== undefined) {
    sections.push(`---`);
    sections.push(`**AI Confidence Score:** ${data.confidenceScore}%`);
    if (data.missingInfo && data.missingInfo.length > 0) {
      sections.push(`**Missing Information:**`);
      data.missingInfo.forEach(info => sections.push(`- ${info}`));
    }
  }

  return sections.join('\n').trim();
};
