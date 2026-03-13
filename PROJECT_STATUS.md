# Project Status

> **Core Philosophy:** Finding a job is a job. JobOS is the workspace for that job.

## 🟢 Current Status: Beta 3.0

### Key Features Shipped

- **Google Sign-In**: Secure OAuth login via Google Identity Services. All per-user data (jobs, contacts, streak, profile) is namespaced in localStorage by Google account ID. Unauthenticated users see a branded login page.
- **LinkedIn for JobOS Chrome Extension v2**: Renamed from "JobOS LinkedIn Scraper". Now handles two modes:
  - Job postings → "Save to JobOS" button
  - Own profile page → "Save Profile to JobOS" button (AI-parses raw text via letsmcp)
- **My Profile**: User-managed profile card with LinkedIn import via AI parsing
- **My Routine**: Daily habit tracker with streak gamification
- **Daily Dashboard**: Command center with pipeline pulse and daily goals
- **AI Copilot** (via letsmcp): Magic Paste, Email Drafter, Resume Analyst, Profile Parser

## 🎯 Roadmap

### Completed
- [x] Google Sign-In with per-user data segregation
- [x] LinkedIn Chrome Extension (job save + profile sync)
- [x] AI Copilot integration (Gemini/Groq/Claude via letsmcp)
- [x] Resume Analyst (PDF/Word support)
- [x] Magic Paste (job detail extraction)
- [x] Smart Email Drafter
- [x] Daily Dashboard with streak tracking
- [x] Data Export/Import (JSON backups)
- [x] Kanban Job Board

### In Progress / Next
- [ ] **Interview Prep Workspace**
  - STAR Story Bank: write and tag behavioral stories
  - Company Research Dossier: structured notes (Mission, Values, Recent News)
- [ ] **Cloud Sync** (optional encrypted backup)

### Backlog
- [ ] Test coverage for streak utility and Dashboard logic
- [ ] GitHub Actions CI/CD workflow

## 🏗️ Technical Notes

### Environment
- Frontend: React 19 + TypeScript + Vite, port 8080
- Backend: [letsmcp](https://github.com/shanebe-ai/letsmcp) (Node.js/Express), port 3002, managed via PM2
- Vite proxies `/api/*` → `http://localhost:3002` (avoids CORS, works for remote access)

### Google OAuth on Raw IP
Google OAuth does not allow raw IP addresses as authorized origins. Workaround: use [nip.io](https://nip.io) — `37.27.80.77.nip.io` resolves to `37.27.80.77`. Add to `vite.config.ts`:
```ts
server: { allowedHosts: ['37.27.80.77.nip.io'] }
```

### Auth Architecture
- Google GSI renders the sign-in button client-side
- On success, Google returns a signed JWT credential
- Decoded client-side (base64) — no backend verification needed for this use case
- User object `{ id, name, email, picture }` persisted to `localStorage` under `job_os_auth`
- All per-user storage keys are prefixed: `<key>__<userId>`. Settings remain global (no prefix).

### Chrome Extension
- MV3, targets `linkedin.com`
- `content.js` detects page type (job vs own profile) and injects the appropriate button
- `background.js` handles API calls to letsmcp at `http://37.27.80.77:3002`
- Download: `/public/LinkedInJobOS.zip` (extracts to `LinkedInJobOS/` folder)

---

## 📝 Session Log

**Last Session:** Google OAuth + per-user data + LinkedIn for JobOS extension v2

- Added Google Sign-In (`AuthContext`, `LoginView`, Google GSI script)
- Per-user localStorage namespacing in `StorageService`
- `AppHeader` now shows user avatar, name, and Sign Out button
- Chrome extension renamed to "LinkedIn for JobOS" v2.0; added profile page detection and "Save Profile to JobOS" button
- letsmcp: added `POST /api/profile` (AI parsing) and `GET /api/profile` endpoints
- Fixed Vite blocking nip.io hostname via `allowedHosts`
- Fixed `UserProfileModal` using hardcoded `http://localhost:3002` instead of relative `/api/profile`

**Next Priority:** Interview Prep Workspace (STAR Story Bank + Company Research Dossier)
