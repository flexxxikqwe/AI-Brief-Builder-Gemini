import { BriefData } from "../src/types";

/**
 * Дефолтная структура брифа на случай отсутствия данных
 */
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
  assumptions: ["Данные сгенерированы с ошибкой парсинга, возможны неточности."],
  technicalApproach: "Технический стек не определен.",
  taskDraft: "Черновик задачи отсутствует.",
  stakeholderReply: "Ответ не сформирован."
};

/**
 * Безопасный парсинг ответа модели
 */
export function parseModelResponse(rawText: string): BriefData {
  let parsed: any = {};

  try {
    // 1. Пытаемся найти JSON внутри текста (на случай если модель добавила ```json ... ```)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : rawText;
    
    parsed = JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse AI response as JSON. Raw text:", rawText);
    return DEFAULT_BRIEF;
  }

  // 2. Нормализация данных (гарантируем наличие всех полей и правильные типы)
  const normalizeString = (val: any, fallback: string) => 
    typeof val === 'string' ? val : fallback;

  const normalizeArray = (val: any) => 
    Array.isArray(val) ? val.filter(item => typeof item === 'string') : [];

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
  };
}
