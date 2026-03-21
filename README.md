# AI Brief Builder MVP

MVP-приложение для автоматической генерации структурированных брифов и ТЗ из сырых запросов.

## Технологический стек
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **AI**: OpenAI API (GPT-4o / GPT-3.5)

## Как запустить локально
1. Установите зависимости: `npm install`
2. Создайте `.env` файл на основе `.env.example` и добавьте свой `OPENAI_API_KEY`.
3. Запустите проект: `npm run dev`
4. Откройте `http://localhost:3000`

## Структура проекта
- `server.ts` — Express сервер с интеграцией Vite.
- `src/App.tsx` — Главный компонент приложения.
- `src/components/` — UI-компоненты.
- `src/types.ts` — Типизация структуры брифа.
