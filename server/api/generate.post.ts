import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `
You are a world-class AI Product Strategist and AI Solutions Architect.
Transform vague business ideas into structured, actionable specifications.

STRICT OUTPUT RULE: Return ONLY a raw JSON object. No markdown, no code blocks, no text before or after JSON.

ADAPTATION LOGIC:
- Adjust tone, priorities, and depth based on PERSONA_FOCUS provided.
- "stakeholderReply" written as direct message to that persona.
- "technicalApproach" matches persona's technical interest level.

VISUALIZATION (mermaidDiagram):
- Valid Mermaid flowchart (flowchart TD).
- NO markdown fences, NO explanations.
- Keep short, clear, renderable.
- Focus on core user flow.

JSON KEYS: summary, businessProblem, goal, targetUser, clarifyingQuestions[], proposedSolution, mvpScope[], outOfScope[], risks[], assumptions[], technicalApproach, taskDraft, stakeholderReply, confidenceScore, missingInfo, mermaidDiagram.
`;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { rawInput, mode, persona, compressToMvp } = body;

  if (!rawInput || rawInput.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Input cannot be empty"
    });
  }

  if (!GEMINI_API_KEY) {
    throw createError({
      statusCode: 500,
      statusMessage: "Gemini API key is not configured on the server"
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const strategy = compressToMvp 
      ? "STRATEGY: Aggressive MVP — ruthlessly cut scope, ship the smallest possible thing that validates the core hypothesis"
      : "STRATEGY: Standard — balanced approach between speed and completeness";

    const userPrompt = `
      CONTEXT: ${mode}
      PERSONA_FOCUS: ${persona}
      ${strategy}
      
      USER_INPUT:
      ${rawInput}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to generate brief"
    });
  }
});
