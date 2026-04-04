import { ref } from 'vue'
import type { BriefData, GenerateParams } from '~/types/brief'

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
`

export const useBrief = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<BriefData | null>(null)
  const history = ref<BriefData[]>([])
  const streamingText = ref('')

  const clearError = () => { error.value = null }

  const restoreFromHistory = (index: number) => {
    if (history.value[index]) result.value = history.value[index]
  }

  // Парсим JSON из текста (модель иногда оборачивает в ```json)
  const parseResponse = (text: string): BriefData | null => {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) return JSON.parse(jsonMatch[0]) as BriefData
    } catch {}
    return null
  }

  const saveToHistory = (data: BriefData, params: GenerateParams) => {
    const item = { ...data, mode: params.mode, persona: params.persona }
    history.value.unshift(item)
    if (history.value.length > 5) history.value.pop()
  }

  // Прямой вызов Gemini из браузера (fallback для AI Studio / статик превью)
  const generateDirect = async (params: GenerateParams): Promise<void> => {
    const config = useRuntimeConfig()
    const apiKey = config.public.geminiApiKey
    if (!apiKey) {
      error.value = 'No API key available. Set NUXT_PUBLIC_GEMINI_API_KEY in environment.'
      return
    }

    const { GoogleGenAI } = await import('@google/genai')
    const ai = new GoogleGenAI({ apiKey })

    const userPrompt = `INPUT_MODE: ${params.mode}
INPUT_PERSONA: ${params.persona}
COMPRESS_TO_MVP: ${params.compressToMvp}

RAW_IDEA:
${params.rawInput}`

    try {
      const stream = await ai.models.generateContentStream({
        model: 'gemini-2.0-flash',
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
        },
      })

      let accumulated = ''
      for await (const chunk of stream) {
        const text = chunk.text
        if (text) {
          accumulated += text
          streamingText.value = accumulated
        }
      }

      const parsed = parseResponse(accumulated)
      if (parsed) {
        result.value = parsed
        saveToHistory(parsed, params)
      } else {
        error.value = 'Failed to parse AI response'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Generation failed'
    }
  }

  // SSE через сервер (production)
  const generateSSE = (params: GenerateParams): Promise<'ok' | 'failed'> => {
    return new Promise((resolve) => {
      const queryParams = new URLSearchParams({
        rawInput: params.rawInput,
        mode: params.mode,
        persona: params.persona,
        compressToMvp: String(params.compressToMvp),
      })

      // Если за 4 секунды соединение не открылось — считаем что сервера нет
      const connectionTimeout = setTimeout(() => {
        if (eventSource) eventSource.close()
        resolve('failed')
      }, 4000)

      const eventSource = new EventSource(`/api/generate/stream?${queryParams}`)
      let connected = false
      let accumulated = ''

      eventSource.onmessage = (event) => {
        if (!connected) {
          connected = true
          clearTimeout(connectionTimeout)
        }

        try {
          const data = JSON.parse(event.data)
          if (data.type === 'chunk') {
            accumulated += data.text
            streamingText.value = accumulated
          }
          if (data.type === 'done') {
            eventSource.close()
            const parsed = parseResponse(accumulated)
            if (parsed) {
              result.value = parsed
              saveToHistory(parsed, params)
              resolve('ok')
            } else {
              error.value = 'Failed to parse AI response'
              resolve('ok')
            }
          }
          if (data.type === 'error') {
            eventSource.close()
            error.value = data.message
            resolve('ok')
          }
        } catch {
          // ignore malformed SSE frames
        }
      }

      eventSource.onerror = () => {
        eventSource.close()
        if (!connected) {
          clearTimeout(connectionTimeout)
          resolve('failed')
        } else {
          error.value = 'Connection lost'
          resolve('ok')
        }
      }
    })
  }

  const generate = async (params: GenerateParams) => {
    loading.value = true
    error.value = null
    result.value = null
    streamingText.value = ''

    const status = await generateSSE(params)
    
    if (status === 'failed') {
      // Fallback to direct client-side call
      await generateDirect(params)
    }

    loading.value = false
  }

  return { loading, error, result, history, streamingText, generate, clearError, restoreFromHistory }
}
