# JobOS

**Your Personal AI-Powered Workspace for the "Job" of Finding a Job.**

Finding a new role isn't just a task—it's a full-time job. **JobOS** provides the professional-grade tools you need to manage it like one.

We replace the chaos of spreadsheets and disparate notes with a unified "Operating System" designed to manage your pipeline, track your professional network, and leverage AI to maximize your productivity. Treat your search with the seriousness it deserves.

## 🚀 Features

- **Google Sign-In**: Secure authentication — all data is segregated per Google account
- **LinkedIn for JobOS Chrome Extension**: One-click job scraping + profile sync directly from LinkedIn
  - Extracts title, company, location, and work type (Remote/Hybrid/On-site)
  - Preserves HTML formatting in job descriptions
  - Save your own LinkedIn profile to auto-populate your JobOS profile
  - Auto-syncs to JobOS dashboard
- **Kanban-Style Job Board**: Visualize your job search pipeline from "Saved" to "Offer"
- **Daily Dashboard**: A centralized command center to track active applications and pipeline metrics
- **Application Management**: Keep track of every detail—job descriptions, contacts, and interview notes—in one place
- **Contact Tracking**: Manage relationships with recruiters, hiring managers, and referrals
- **Engagement Log**: Track all outreach, follow-ups, and interview activities
- **My Routine**: Daily habit tracker with streak gamification to maintain momentum
- **Data Resilience**: Export/Import your data to JSON backups or fully reset your workspace
- **AI Copilot** (requires [LetsMCP](https://github.com/shanebe-ai/letsmcp)):
  - **Magic Paste**: Extract job details from pasted text or LinkedIn URLs
  - **Outreach Drafter**: Generate personalized cold outreach emails and follow-ups
  - **Resume Analyst**: Analyze your resume against job descriptions to identify gaps and keywords
  - **Profile Parser**: AI-extracts your LinkedIn profile into structured data

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Auth**: Google Identity Services (GSI) — client-side JWT, no backend required
- **Styling**: Modern CSS3 (Variables, Flexbox/Grid)
- **State Management**: React Hooks & Context
- **Testing**: Vitest, React Testing Library
- **Linting**: ESLint

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shanebe-ai/jobos.git
   cd jobos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables — copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   | Variable | Description |
   |---|---|
   | `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Web Client ID |

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:8080`.
   - The app proxies `/api/*` requests to the backend at `http://localhost:3002`. Ensure [letsmcp](https://github.com/shanebe-ai/letsmcp) is running there for AI features.

### Google OAuth Setup

JobOS uses Google Sign-In for authentication. To configure it:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**
2. Create an **OAuth 2.0 Client ID** → Web application
3. Add your domain to **Authorized JavaScript origins**:
   - Local dev: `http://localhost:8080`
   - Remote server: use a domain (Google does not accept raw IPs — see nip.io tip below)
4. Copy the Client ID into your `.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   ```

> **Tip — Hosting on a raw IP?** Google OAuth requires a domain name. Use [nip.io](https://nip.io) — if your server IP is `1.2.3.4`, your domain becomes `1.2.3.4.nip.io` (resolves automatically). Add `http://1.2.3.4.nip.io:8080` as your authorized origin and set `allowedHosts: ['1.2.3.4.nip.io']` in `vite.config.ts`.

### Chrome Extension Setup

The **LinkedIn for JobOS** extension lets you save jobs and sync your profile directly from LinkedIn.

1. **Download** `LinkedInJobOS.zip` from the JobOS dashboard (Extension Install page) or from `/public/LinkedInJobOS.zip`

2. **Install** in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extracted `LinkedInJobOS` folder

3. **Usage**:
   - On any **LinkedIn job posting**: click "Save to JobOS" (bottom right)
   - On your **own LinkedIn profile**: click "Save Profile to JobOS" to import your info

## 🧪 Running Tests

```bash
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
