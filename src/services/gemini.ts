import type { GenerationMode, GenerationPersona } from '../types';

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
  confidenceScore: number;
  missingInfo: string;
  mermaidDiagram: string;
}

export const DEFAULT_BRIEF: BriefData = {
  summary: "Waiting for input...",
  businessProblem: "Not defined",
  goal: "Not defined",
  targetUser: "Not defined",
  clarifyingQuestions: [],
  proposedSolution: "Not defined",
  mvpScope: [],
  outOfScope: [],
  risks: [],
  assumptions: [],
  technicalApproach: "Not defined",
  taskDraft: "Not defined",
  stakeholderReply: "Not defined",
  confidenceScore: 0,
  missingInfo: "None",
  mermaidDiagram: "graph TD\n  A[Start] --> B[End]"
};

/**
 * Parses the model response and handles potential JSON errors
 */
export function parseModelResponse(text: string): BriefData {
  try {
    // Remove potential markdown code blocks if the model ignored instructions
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return {
      ...DEFAULT_BRIEF,
      summary: "Error parsing AI response. Please try again.",
      proposedSolution: text.substring(0, 500) + "..."
    };
  }
}

/**
 * Calls the server-side Gemini API to generate a product brief
 */
export async function generateBrief(
  rawInput: string,
  mode: GenerationMode,
  persona: GenerationPersona,
  compressToMvp: boolean
): Promise<BriefData> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawInput,
        mode,
        persona,
        compressToMvp
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    return data as BriefData;
  } catch (error: any) {
    console.error("Brief generation failed:", error);
    throw error;
  }
}
