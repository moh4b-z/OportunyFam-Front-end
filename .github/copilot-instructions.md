# Copilot / AI Agent instructions for OportunyFam-Front-end

Short, focused guidance to help AI code assistants be immediately productive in this repo.

1. Project type & key commands
   - Next.js (App Router) + TypeScript. Dev: `npm run dev` (or `pnpm dev` / `yarn dev`). Build: `npm run build`. Start: `npm start`.
   - No test suite is present in the repository.

2. Big-picture architecture (what to edit / where to look)
   - app/: Next.js app router UI and routes (React 19 / Next 15). Use this for page-level layout and routing.
   - src/components/: UI components and `src/components/modals/` for modal implementations. Many components are client components and use CSS modules.
   - src/contexts/: React contexts (e.g., `AuthContext.tsx`) hold client-side auth state and login logic.
   - src/services/: Business logic and external communication (API + Azure upload helpers). Prefer updating services when changing API interactions.
   - src/app/styles and src/components/*.css: global + component styles (mix of CSS modules and plain CSS files).

3. Authentication & routing patterns (important)
   - Cookie-based authentication: `auth-token` cookie is used across the app (see `src/middleware.ts`). Middleware redirects unauthenticated users to `/login`.
   - `AuthContext.tsx` uses cookies + `localStorage` (`user-data`, `remember-me`) and calls `authService.login()` followed by `childService.getUserById()` to determine roles/children.
   - **User types**: The system distinguishes 3 user types (`tipo` field from login API): `'usuario'` (responsible/parent), `'instituicao'` (institution), `'crianca'` (child). Each has different IDs (`usuario_id`, `instituicao_id`, `crianca_id`) plus a shared `pessoa_id` for chat.
   - **Type-specific behavior**: Institutions don't see the map (they see a control panel placeholder), can't register children, and don't see location/search buttons. Children can't register other children. Only `usuario` type can register children.
   - **Shared functionality**: All user types have access to: profile (Perfil), notifications, conversations/chat, logout, and settings. These are universal features regardless of user type.
   - Example to reference: `src/contexts/AuthContext.tsx` (look for how login sets cookie, `user-data` value, and extracts `tipo`).

4. API & external integration patterns
   - API base URL is in `src/services/config.ts` as `API_BASE_URL`. Services call this via fetch and follow a consistent error/response-check pattern.
   - Azure blob uploads use environment variables `NEXT_PUBLIC_AZURE_*` and the `azureStorageService` which performs PUT requests directly to blob URLs with SAS tokens. See `src/services/azureStorageService.ts` and `env.local.txt` for examples.

5. TypeScript + path aliases you must respect
   - Tsconfig contains paths: `@/*`, `@services/*`, `@components/*`. Use these aliases when importing to match repo convention.
   - Strict TypeScript settings — keep or add narrow typings and runtime checks when modifying services or contexts.

6. Error handling & network patterns to follow
   - Services return errors with meaningful message strings and handle `response.ok` checks. Follow these existing patterns when adding API calls.
   - When adding new fetch calls, follow the same shape: check `response.ok`, parse `.json()`, provide sensible fallbacks for network errors.

7. UI / UX patterns
   - Lots of modal components live in `src/components/modals/` — follow the existing controlled-modal pattern (`isOpen` / `onClose` patterns) and CSS module usage.
   - Client-only logic (browser APIs, localStorage, cookies) usually lives inside components using `'use client'` at the top.

8. Secrets & environment practices
   - Repo uses NEXT_PUBLIC_* publicly scoped environment variables for runtime usage (in `env.local.txt`). Do not commit private keys — use `.env.local` / Vercel secret environment variables for deployment.
   - Important env vars used: `NEXT_PUBLIC_GEOCODER_PROVIDER`, `NEXT_PUBLIC_GOOGLE_MAPS_KEY`, `NEXT_PUBLIC_AZURE_STORAGE_*`.

9. When proposing changes (PRs) — pragmatic rules
   - Update or add small focused changes (follow existing patterns). For network changes, include fallback/error behavior similar to `childService.getSexoOptions()`.
   - When editing auth, keep middleware cookie behavior and `AuthContext` contracts unchanged unless explicitly migrating the auth flow.
   - Add or update examples inline references to the affected service/component file in the PR description.

10. Where to look for examples while coding
   - Auth flow: `src/contexts/AuthContext.tsx` & `src/services/authService.ts`
   - External API shape & error handling: `src/services/childService.ts`, `src/services/institutionService.ts`
   - Blob uploads: `src/services/azureStorageService.ts` + `env.local.txt`
   - Routing & middleware: `src/middleware.ts` and `app/` routes

If you'd like, I can now:
- Expand any section with short code snippets showing “do/don't” examples, or
- Add a lightweight CONTRIBUTING.md or PR template to encourage consistent changes.

Please review and tell me what else you want emphasized or corrected.