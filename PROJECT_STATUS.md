# Project Status

> **Core Philosophy:** Finding a job is a job. JobOS is the workspace for that job.

## 🟢 Current Status: Beta 2.1
The application has evolved into a robust "Job Search OS".
**Key New Features:**
*   **Daily Dashboard:** A "Command Center" home view with daily goals (3 apps/day), pipeline pulse, and focus tracking.
*   **Data Resilience:** Full JSON Export/Import capabilities and "Erase All" functionality for data management.
*   **Intelligence Layer:** Gemini-powered Resume Analysis, Email Drafting, and Magic Paste.
*   **LinkedIn Chrome Extension:** One-click job scraping directly from LinkedIn job postings with smart page detection.
*   **Streak Tracking:** Gamified daily activity tracking to maintain job search momentum.

## 🎯 Immediate Roadmap (Next Steps)

### 1. 🧠 Intelligence Layer (The "Copilot")
*Turn the tool from a passive record-keeper into an active assistant.*
- [x] **Real AI Integration:** Connect mock services to a real LLM Provider (Google Gemini).
- [x] **Resume Analyst:** Implement the "Resume vs. Job Description" gap analysis.
- [x] **Smart File Extraction:** Direct support for PDF and Word document text extraction.
- [x] **Magic Paste:** Uses AI to extract structured job data from messy text.
- [x] **Smart Email Drafter:** Generate outreach emails and cover letters based on the job context.

### 2. 🛡️ Data Resilience (The "Filing Cabinet")
*Your work is valuable; losing it is not an option.*
- [x] **Data Export/Import:** Allow users to create backups of their local database (`.json`).
- [x] **Erase All Data:** "Factory Reset" option for a clean slate.
- [ ] **Cloud Sync (Future):** Optional encrypted cloud sync.

### 3. ⚡ "Daily Standup" & Accountability
*Treating the search like a job means having daily goals.*
- [x] **Daily Dashboard:** A view showing today's targets (e.g., "3 Applications", "2 Follow-ups").
- [x] **Daily Goal Tracker:** Progress bar for daily application targets.
- [x] **Streak Tracking:** Gamification to maintain momentum with fire emojis and motivational messages.

### 4. 🎤 Interview Preparation Workspace (New!)
*Preparation is half the work.*
- [ ] **STAR Story Bank:** A dedicated section to write and tag stories for behavioral questions.
- [ ] **Company Research Dossier:** Structured notes for company research (Mission, Values, Recent News).

### 5. 🔌 Automated Job Ingestion
*Minimize data entry, maximize analysis.*
- [x] **Chrome Extension:** LinkedIn scraper extension with smart page detection (only shows on job postings).
- [x] **Smart URL Paste:** (Implemented as Magic Paste) Paste a job link or text, and let the Copilot fill details.
- [ ] **Email Parsing:** (Long-term) Forward application confirmations to a specific address to auto-create "Applied" records.

## 🏗️ Technical Health
- **Testing:** Basic setup with Vitest. Needs higher coverage for core domain logic.
- **CI/CD:** Basic GitHub Actions workflow needed for automated checking.

---

## 📝 Context Log for Next Session
*Read this before starting work.*

**Last Completed:** Chrome Extension location scraping & pipeline count fixes.
*   **Fixed:** Chrome extension auto-creates a `Saved` Application on job sync — pipeline count is now accurate.
*   **Fixed:** Active Pipeline metric now correctly excludes `Withdrawn` (previously only excluded `Rejected`).
*   **Fixed:** Location scraping on `/jobs/view/` — post-company text scan avoids breadcrumb/nav text like "Home".
*   **Fixed:** Location scraping splits on all LinkedIn separators (`·`, `•`, newlines) and filters metadata before taking first clean token.
*   **Working:** Both `/jobs/collections/` and `/jobs/view/` correctly extract location (e.g. "Canada", "Toronto, Canada").

**Next Priority:** **Interview Prep Workspace**.
*   **STAR Story Bank:** Create a dedicated section to write and tag stories for behavioral questions.
*   **Company Research Dossier:** Structured notes for company research (Mission, Values, Recent News).

**Known Issues/Debts:**
*   **Test Coverage:** Add tests for streak utility and Dashboard logic.
*   **CI/CD:** Basic GitHub Actions workflow needed for automated checking.
