# Project Status

> **Core Philosophy:** Finding a job is a job. JobOS is the workspace for that job.

## 🟢 Current Status: Prototype / Beta
The application is functional as a local-first application tracker. It allows users to visualize their pipeline, manage contacts, and mock drafting outreach emails.

## 🎯 Immediate Roadmap (Next Steps)

### 1. 🧠 Intelligence Layer (The "Copilot")
*Turn the tool from a passive record-keeper into an active assistant.*
- [x] **Real AI Integration:** Connect mock services to a real LLM Provider (Google Gemini).
- [x] **Resume Analyst:** Implement the "Resume vs. Job Description" gap analysis.
- [x] **Smart File Extraction:** Direct support for PDF and Word document text extraction.
- [x] **Magic Paste:** Uses AI to extract structured job data from messy text.
- [ ] **Smart Email Drafter:** Generate outreach emails and cover letters based on the job context.

### 2. 🛡️ Data Resilience (The "Filing Cabinet")
*Your work is valuable; losing it is not an option.*
- [ ] **Data Export/Import:** Allow users to create backups of their local database (`.json` or `.zip`).
- [ ] **Cloud Sync (Future):** Optional encrypted cloud sync.

### 3. ⚡ "Daily Standup" & Accountability (New!)
*Treating the search like a job means having daily goals.*
- [ ] **Daily Dashboard:** A view showing today's targets (e.g., "3 Applications", "2 Follow-ups").
- [ ] **Streak Tracking:** Gamification to maintain momentum.

### 4. 🎤 Interview Preparation Workspace (New!)
*Preparation is half the work.*
- [ ] **STAR Story Bank:** A dedicated section to write and tag stories for behavioral questions.
- [ ] **Company Research Dossier:** Structured notes for company research (Mission, Values, Recent News).

### 5. 🔌 Automated Job Ingestion
*Minimize data entry, maximize analysis.*
- [ ] **Chrome Extension:** A browser extension to "clip" job details directly from LinkedIn/Indeed/Greenhouse into JobOS.
- [x] **Smart URL Paste:** (Implemented as Magic Paste) Paste a job link or text, and let the Copilot fill details.
- [ ] **Email Parsing:** (Long-term) Forward application confirmations to a specific address to auto-create "Applied" records.

## 🏗️ Technical Health
- **Testing:** Basic setup with Vitest. Needs higher coverage for core domain logic.
- **CI/CD:** Basic GitHub Actions workflow needed for automated checking.
