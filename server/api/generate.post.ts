import { GoogleGenAI } from "@google/genai";

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 1000;

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
  const config = useRuntimeConfig();
  const GEMINI_API_KEY = config.geminiApiKey;

  // 1. Rate Limiting
  const ip = getHeader(event, 'x-forwarded-for') || event.node.req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const limitData = rateLimitMap.get(ip);

  if (limitData && now < limitData.resetAt) {
    if (limitData.count >= RATE_LIMIT) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Try again in a minute.'
      });
    }
    limitData.count++;
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }

  // Clean up old entries occasionally
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) rateLimitMap.delete(key);
    }
  }

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
      statusMessage: "Server configuration error: Gemini API key is missing"
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

    // 2. Timeout (25s)
    const aiCall = ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 25000)
    );

    const response = await Promise.race([aiCall, timeoutPromise]);

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(text);
  } catch (error: unknown) {
    console.error("Gemini Generation Error:", error);
    
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      
      if (msg.includes('timeout')) {
        throw createError({ statusCode: 504, statusMessage: 'AI took too long, please try again' });
      }
      
      if (msg.includes('429') || msg.includes('quota')) {
        throw createError({ statusCode: 503, statusMessage: 'AI quota exceeded, try later' });
      }
      
      if (msg.includes('api key')) {
        throw createError({ statusCode: 500, statusMessage: 'Server configuration error' });
      }

      throw createError({
        statusCode: 500,
        statusMessage: error.message || "Failed to generate brief"
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "An unexpected error occurred during generation"
    });
  }
});
