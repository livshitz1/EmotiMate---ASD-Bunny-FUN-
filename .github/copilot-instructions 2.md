# Copilot / AI Agent Instructions for EmotiMate

Purpose
- Help contributors quickly make productive code changes in this small React + Vite app that uses Gemini (GenAI) for text, image and TTS.

Quick start (what to run)
- Install: `npm install`
- Dev server: `npm run dev` (Vite on port 3000)
- Build: `npm run build`, Preview: `npm run preview`
- Env: set `GEMINI_API_KEY` in `.env.local` (services expect `process.env.API_KEY` / `GEMINI_API_KEY`). See [README.md](README.md).

Architecture overview (big picture)
- Frontend: React + TypeScript + Vite. Entry: [index.tsx](index.tsx) → [App.tsx](App.tsx).
- UI Components: located in `components/` (e.g., [BunnyAvatar.tsx](components/BunnyAvatar.tsx), [Controls.tsx](components/Controls.tsx)). Components are functional, typed with `types.ts`.
- State & flows: `App.tsx` owns app state (bunny, schedule, chatHistory). UI actions (feed, play, sleep, hug) trigger optimistic local state updates, then call GenAI via `services/geminiService.ts`.
- AI integration: `services/geminiService.ts` calls Gemini models for text (`generateEmotiMateResponse`), images (`generateBunnyImage`) and TTS (`generateBunnySpeech`). Prompts and system behavior are defined in `constants.ts` (see `SYSTEM_INSTRUCTION` and `IMAGE_GENERATION_PROMPT_TEMPLATE`).

Project-specific conventions & patterns
- Language: UX and generated responses are Hebrew-first. `Emotion` enum values, prompts, and `SYSTEM_INSTRUCTION` are Hebrew—keep that context when editing text or prompts. See [constants.ts](constants.ts) and [types.ts](types.ts).
- Optimistic updates: UI updates local `bunny` state before waiting for AI; maintain this pattern for responsiveness (see `handleInteraction` in [App.tsx](App.tsx)).
- Audio handling: TTS returns base64 PCM that the client decodes via an AudioContext. See `AudioPlayer.tsx` for decode assumptions (sampleRate 24000, Int16). If you change TTS output format, update the player accordingly.
- Image handling: image parts are read from `response.candidates[0].content.parts` and returned as data URI. Keep `generateBunnyImage` and the `BunnyAvatar` fallback behavior in sync.

Integration & external deps
- Uses `@google/genai` client in `services/geminiService.ts`. Model names in use: `gemini-3-flash-preview`, `gemini-2.5-flash-image`, `gemini-2.5-flash-preview-tts`. Avoid changing models without testing end-to-end.
- Env: Vite loads env vars and maps them to `process.env.API_KEY` / `process.env.GEMINI_API_KEY` in `vite.config.ts`.

Editing guidance (practical rules for AI edits)
- When modifying prompts or `SYSTEM_INSTRUCTION`, keep responses short (2–3 Hebrew sentences) and child-friendly—this is intentional in `constants.ts`.
- Respect the optimistic-update pattern in `App.tsx`; keep async calls off the critical UI path where possible and use `isMounted` refs to avoid setState after unmount.
- If you change TTS model or speech config, update `generateBunnySpeech` and `AudioPlayer.tsx` together—mismatches break playback.
- Tests: none present. Run the app locally (`npm run dev`) and interact with UI to validate AI flows.

Quick examples (how pieces fit)
- Trigger flow: `Controls` → calls `onAction` → `App.handleInteraction()` → calls `generateEmotiMateResponse`, `generateBunnyImage`, `generateBunnySpeech` in parallel → updates `chatHistory`, `currentImage` and plays audio.
- Prompt source: `SYSTEM_INSTRUCTION` and `IMAGE_GENERATION_PROMPT_TEMPLATE` in [constants.ts](constants.ts).

Where to look first
- Start: [App.tsx](App.tsx) (state + handlers) and [services/geminiService.ts](services/geminiService.ts) (AI integration).
- Supporting: [constants.ts](constants.ts), [AudioPlayer.tsx](components/AudioPlayer.tsx), [BunnyAvatar.tsx](components/BunnyAvatar.tsx).

If you need to change secrets or API keys
- Do not commit keys. Use `.env.local` and update `vite.config.ts` / environment accordingly. Verify runtime `process.env.GEMINI_API_KEY` is populated during `npm run dev`.

When uncertain
- Run the app locally and simulate the flow: perform an action (feed/play) and inspect devtools network and console logs to see model responses and parts.
- Preserve Hebrew tone in any output text changes.

Questions or gaps
- If you want more examples (request/response payloads, exact audio format), tell me which flow to instrument and I will add sample logs and tests.
