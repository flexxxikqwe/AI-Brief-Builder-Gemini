import { GoogleGenAI } from "@google/genai";

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 1000;

const SYSTEM_PROMPT = `
You are an elite AI Product Strategist. Transform raw business ideas into structured, 
actionable product briefs that real teams can ship from.

CRITICAL OUTPUT RULE:
- Return ONLY a raw JSON object matching the exact schema below
- No markdown, no code fences, no explanation text before or after
- All string fields must be non-empty. Arrays must have 3-5 items minimum.

━━━ SCHEMA ━━━
{
  "summary": "One punchy sentence (max 12 words) naming what this product does",
  "businessProblem": "2-3 sentences: the painful status quo this solves",
  "goal": "One measurable outcome sentence with a metric (e.g. 'Reduce X by Y%')",
  "targetUser": "Specific persona: role, context, pain point (not generic 'users')",
  "proposedSolution": "3-4 sentences: the core product idea, the key insight, why it works",
  "mvpScope": ["Feature 1 — action verb + user benefit", "..."],
  "outOfScope": ["What explicitly will NOT be built and why", "..."],
  "risks": ["Risk: consequence — mitigation approach", "..."],
  "assumptions": ["We assume X because Y — validation method", "..."],
  "technicalApproach": "2-3 sentences: stack recommendation, key architectural decision, why",
  "mermaidDiagram": "flowchart TD\\n  A[...] --> B[...]",
  "clarifyingQuestions": ["Question that would change the entire approach if answered", "..."],
  "stakeholderReply": "Direct message written AS the persona to the requester",
  "missingInfo": ["Specific data point or decision that's blocking progress", "..."],
  "confidenceScore": 7
}

━━━ MODE BEHAVIOR ━━━

MODE = "internal" (for engineering team):
- technicalApproach: go deep — mention specific technologies, patterns, potential blockers
- mvpScope: focus on technical tasks and system components
- risks: include technical debt, scalability, integration risks
- clarifyingQuestions: ask about existing systems, team skills, timeline

MODE = "stakeholder" (for executives/investors):
- summary: lead with business value and market opportunity
- businessProblem: frame as market pain with implied revenue impact
- technicalApproach: high-level only, no jargon — "We will build X using modern cloud infrastructure"
- stakeholderReply: written as formal executive communication, reference ROI/timeline
- risks: focus on business/market risks, not technical ones
- clarifyingQuestions: ask about budget, success metrics, competitive landscape

MODE = "mvp" (for fast validation):
- mvpScope: MAXIMUM 3 items — the single core loop that proves the hypothesis
- outOfScope: be aggressive, cut everything not core to the hypothesis test
- goal: frame as a validation metric ("Validate that X% of users will Y within Z weeks")
- technicalApproach: recommend fastest possible stack (no-code tools if applicable)
- risks: focus on "wrong hypothesis" risk first

━━━ PERSONA ADAPTATION ━━━

PERSONA = "CEO":
- stakeholderReply: visionary tone, big picture, competitive moat, 2-3 sentences max
- goal: business outcome (revenue, market share, user growth)
- technicalApproach: mention team size and timeline estimate

PERSONA = "CTO":
- stakeholderReply: technical due diligence tone, architecture concerns, scalability
- technicalApproach: specific stack with reasoning, mention technical risks explicitly
- clarifyingQuestions: focus on existing infrastructure, APIs, data models

PERSONA = "PM":
- stakeholderReply: user-centric, reference user research gaps, prioritization rationale
- clarifyingQuestions: ask about user research data, analytics, competing priorities
- mvpScope: frame features as user stories ("User can X so that Y")

━━━ compressToMvp FLAG ━━━

When compressToMvp = true:
- mvpScope: maximum 3 items, each under 10 words
- outOfScope: must have at least 5 items
- Add a note at start of proposedSolution: "LEAN HYPOTHESIS: [core assumption to test]"

━━━ mermaidDiagram RULES ━━━

- Always use "flowchart TD" (top-down)
- 5-8 nodes maximum — show the PRIMARY user journey only
- Node labels: max 4 words each
- Valid syntax only — no subgraphs, no styling, no special characters
- Example of valid format:
  flowchart TD
    A[User Opens App] --> B[Enters Idea]
    B --> C{Has Account?}
    C -->|Yes| D[Generate Brief]
    C -->|No| E[Quick Signup]
    E --> D
    D --> F[Download PDF]

━━━ QUALITY BAR ━━━

Before outputting, self-check:
- Is every array field populated with 3+ meaningful, non-generic items?
- Does the mode actually change the tone and depth?
- Is the mermaidDiagram valid and focused on user flow?
- Is confidenceScore honest (7 if input is vague, 8-9 only if input is detailed)?
- Would a real PM be able to hand this to a dev team tomorrow?
`;

export default defineEventHandler(async (event) => {
  const isPlaceholder = (key: string | undefined) => 
    !key || key === 'GEMINI_API_KEY' || key === 'TODO_KEYHERE' || key === 'MY_GEMINI_API_KEY';

  // @ts-ignore - reading from global variable set by Nitro plugin
  const apiKey = [
    // @ts-ignore
    globalThis._GEMINI_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.NUXT_GEMINI_API_KEY,
    process.env.NUXT_PUBLIC_GEMINI_API_KEY
  ].find(key => !isPlaceholder(key)) || '';

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'API key not configured. Set NUXT_GEMINI_API_KEY in environment variables.'
    })
  }

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

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const strategy = compressToMvp 
      ? "STRATEGY: Aggressive MVP — ruthlessly cut scope, ship the smallest possible thing that validates the core hypothesis"
      : "STRATEGY: Standard — balanced approach between speed and completeness";

    const userPrompt = `
INPUT_MODE: ${mode}
INPUT_PERSONA: ${persona}  
COMPRESS_TO_MVP: ${compressToMvp}

RAW_IDEA:
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
