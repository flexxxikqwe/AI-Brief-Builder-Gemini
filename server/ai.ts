import { GoogleGenAI } from "@google/genai";
import { BriefData, GenerationMode } from "../src/types";
import { parseModelResponse } from "./parser";

const SYSTEM_PROMPT = `
You are a world-class AI Product Strategist and AI Solutions Architect. 
Transform vague business ideas into structured, actionable specifications.

PRINCIPLES: No hallucinations, explicit assumptions, MVP focus, business value first.

OUTPUT: Return ONLY a valid JSON object.
Keys: summary, businessProblem, goal, targetUser, clarifyingQuestions[], proposedSolution, mvpScope[], outOfScope[], risks[], assumptions[], technicalApproach, taskDraft, stakeholderReply.
`;

export class AiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generate(rawInput: string, mode: GenerationMode, compressToMvp: boolean): Promise<BriefData> {
    const context = {
      internal: "Technical clarity, implementation details.",
      stakeholder: "Business value, ROI, strategic alignment.",
      mvp: "Extreme speed to market, cutting non-essential features."
    }[mode];

    const userPrompt = `
      CONTEXT: ${context}
      MVP_MODE: ${compressToMvp ? "Aggressive scope reduction" : "Balanced first version"}
      REQUEST: "${rawInput}"
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{ parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const text = response.text || "";
      // Используем безопасный парсер вместо прямого JSON.parse
      return parseModelResponse(text);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const aiService = new AiService();
