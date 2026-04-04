# AI Brief Builder

Turn your messy business ideas into structured, actionable product specifications in seconds.

## Tech Stack

- **Frontend:** Nuxt 3, Vue 3, TypeScript, Pinia, Tailwind CSS
- **Backend:** Nitro (Nuxt Server Engine), Gemini AI (Google GenAI SDK)
- **Visualization:** Mermaid.js
- **Icons:** Lucide Vue Next

## Features

- **AI Generation:** Secure server-side integration with Gemini 2.0 Flash.
- **Structured Briefs:** Generates summary, goals, MVP scope, risks, and technical approach.
- **User Flow Visualization:** Automatic Mermaid diagram generation and rendering.
- **Export:** Download briefs as Markdown files.
- **History:** In-memory history of recent generations (last 5).
- **Security:** JWT-protected API routes and rate limiting.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file based on `.env.example` and add your `GEMINI_API_KEY`.

3. Start the development server:
   ```bash
   npm run dev
   ```

## Testing Credentials

- **Username:** admin
- **Password:** password
