export default defineNitroPlugin((nitroApp) => {
  const isPlaceholder = (key: string | undefined) => 
    !key || key === 'GEMINI_API_KEY' || key === 'TODO_KEYHERE' || key === 'MY_GEMINI_API_KEY';

  // Читаем ключ напрямую из process.env в рантайме
  const apiKey = [
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    process.env.NUXT_PUBLIC_GEMINI_API_KEY,
    process.env.NUXT_GEMINI_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.API_KEY
  ].find(key => !isPlaceholder(key)) || '';
  
  // Сохраняем в глобальную переменную для доступа из эндпоинтов
  // @ts-ignore
  globalThis._GEMINI_API_KEY = apiKey;
  
  if (!apiKey) {
    console.warn('[Nitro Plugin] GEMINI_API_KEY is not set or invalid in environment variables.');
  } else {
    console.log('[Nitro Plugin] Server-side Gemini API Key initialized successfully.');
  }
});
