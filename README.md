# AI Brief Builder

Turn your messy business ideas into structured, actionable product specifications in seconds. AI Brief Builder uses Gemini AI to transform raw thoughts into professional briefs with goals, MVP scope, technical approaches, and user flow visualizations.

## Key Features

- **AI-Powered Generation:** Leverages Gemini 2.0 Flash for high-quality product strategy.
- **Multiple Modes:**
  - **Internal:** Deep technical details for engineering teams.
  - **Stakeholder:** Business-value focused for executives.
  - **MVP:** Ruthless scope cutting for fast validation.
- **Persona Adaptation:** Tailors the response tone and content for CEO, CTO, or PM.
- **Visual User Flows:** Automatically generates Mermaid.js diagrams for the primary user journey.
- **Streaming UI:** Real-time feedback during generation with a robust client-side fallback.
- **Export:** Download your briefs as structured Markdown files.
- **Multilingual:** Supports English and Russian for both UI and AI responses.
- **Dark Mode:** Fully responsive and consistent dark/light theme support.

## Tech Stack

- **Frontend:** Nuxt 4, Vue 3, TypeScript, Tailwind CSS
- **Backend:** Nitro (Nuxt Server Engine), Gemini AI (@google/genai)
- **Visualization:** Mermaid.js
- **Icons:** Lucide Vue Next

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file or set environment variables:
   - `NUXT_GEMINI_API_KEY`: Your Gemini API Key (Server-side).
   - `NUXT_PUBLIC_GEMINI_API_KEY`: Your Gemini API Key (Client-side fallback).

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Architecture

- **Composables:** `useBrief` handles the generation logic, switching between Server-Sent Events (SSE) and direct client-side calls to ensure stability in different environments (like AI Studio preview vs production).
- **Server API:** Nitro endpoints handle rate limiting and secure AI communication.
- **Theme/Locale:** Custom composables for zero-dependency theme and language management.

## Deployment

The project is ready for deployment on platforms like Render, Vercel, or Cloud Run. Ensure `NUXT_GEMINI_API_KEY` is set in your production environment.
