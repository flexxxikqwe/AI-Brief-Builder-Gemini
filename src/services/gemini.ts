import { GoogleGenAI } from "@google/genai";
import { BriefData, GenerationMode, GenerationPersona } from "../types";

const SYSTEM_PROMPT = `
You are a world-class AI Product Strategist and AI Solutions Architect. 
Transform vague business ideas into structured, actionable specifications.

STRICT OUTPUT RULE: Return ONLY a raw JSON object. No markdown, no code blocks (no \`\`\`json), no text before or after JSON.

ADAPTATION LOGIC:
- Adjust the tone, priorities, and depth of all fields based on the PERSONA_FOCUS provided.
- "stakeholderReply" should be written as a direct message to that specific persona.
- "technicalApproach" should match the persona's level of technical interest (strategic for CEO, architectural for CTO, delivery-focused for PM).

VISUALIZATION (mermaidDiagram):
- Provide a valid Mermaid flowchart (e.g., flowchart TD).
- NO markdown fences (\`\`\`mermaid), NO explanations, NO extra text.
- Keep it short, clear, and renderable.
- Focus on the core user flow or logic of the proposed solution.

JSON KEYS: summary, businessProblem, goal, targetUser, clarifyingQuestions[], proposedSolution, mvpScope[], outOfScope[], risks[], assumptions[], technicalApproach, taskDraft, stakeholderReply, confidenceScore, missingInfo, mermaidDiagram.
`;

const DEFAULT_BRIEF: BriefData = {
  summary: "Не удалось сгенерировать краткое описание.",
  businessProblem: "Проблема не определена.",
  goal: "Цель не сформулирована.",
  targetUser: "Целевая аудитория не указана.",
  clarifyingQuestions: [],
  proposedSolution: "Решение не предложено.",
  mvpScope: [],
  outOfScope: [],
  risks: [],
  assumptions: ["Ошибка при генерации или парсинге."],
  technicalApproach: "Технический стек не определен.",
  taskDraft: "Черновик задачи отсутствует.",
  stakeholderReply: "Ответ не сформирован.",
  confidenceScore: 50,
  missingInfo: [],
  mermaidDiagram: ""
};

function parseModelResponse(rawText: string): BriefData {
  let parsed: any = {};
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : rawText;
    parsed = JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse AI response:", rawText);
    return DEFAULT_BRIEF;
  }

  const normalizeString = (val: any, fallback: string) => typeof val === 'string' ? val : fallback;
  const normalizeArray = (val: any) => Array.isArray(val) ? val.filter(item => typeof item === 'string') : [];

  return {
    summary: normalizeString(parsed.summary, DEFAULT_BRIEF.summary),
    businessProblem: normalizeString(parsed.businessProblem, DEFAULT_BRIEF.businessProblem),
    goal: normalizeString(parsed.goal, DEFAULT_BRIEF.goal),
    targetUser: normalizeString(parsed.targetUser, DEFAULT_BRIEF.targetUser),
    clarifyingQuestions: normalizeArray(parsed.clarifyingQuestions),
    proposedSolution: normalizeString(parsed.proposedSolution, DEFAULT_BRIEF.proposedSolution),
    mvpScope: normalizeArray(parsed.mvpScope),
    outOfScope: normalizeArray(parsed.outOfScope),
    risks: normalizeArray(parsed.risks),
    assumptions: normalizeArray(parsed.assumptions),
    technicalApproach: normalizeString(parsed.technicalApproach, DEFAULT_BRIEF.technicalApproach),
    taskDraft: normalizeString(parsed.taskDraft, DEFAULT_BRIEF.taskDraft),
    stakeholderReply: normalizeString(parsed.stakeholderReply, DEFAULT_BRIEF.stakeholderReply),
    confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : DEFAULT_BRIEF.confidenceScore,
    missingInfo: normalizeArray(parsed.missingInfo),
    mermaidDiagram: normalizeString(parsed.mermaidDiagram, DEFAULT_BRIEF.mermaidDiagram),
  };
}

export async function generateBrief(
  rawInput: string, 
  mode: GenerationMode, 
  persona: GenerationPersona, 
  compressToMvp: boolean
): Promise<BriefData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured in the environment.");

  const ai = new GoogleGenAI({ apiKey });
  
  const context = {
    internal: "Focus on technical clarity and dev-friendly task drafts.",
    stakeholder: "Focus on business value and strategic alignment.",
    mvp: "Extreme speed to market and aggressive scope reduction."
  }[mode];

  const personaInstruction = {
    CEO: "STRATEGIC FOCUS: ROI, market positioning. Tone: Executive.",
    CTO: "TECHNICAL FOCUS: Architecture, scalability. Tone: Analytical.",
    PM: "DELIVERY FOCUS: Features, dependencies. Tone: Actionable."
  }[persona];

  const userPrompt = `
    Analyze this request: "${rawInput}"
    CONTEXT: ${context}
    PERSONA: ${personaInstruction}
    STRATEGY: ${compressToMvp ? "Aggressive MVP" : "Standard First Version"}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  return parseModelResponse(response.text || "");
}
