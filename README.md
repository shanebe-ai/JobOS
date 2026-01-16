# JobOS

**Your Personal AI-Powered Workspace for the "Job" of Finding a Job.**

Finding a new role isn't just a task—it's a full-time job. **JobOS** provides the professional-grade tools you need to manage it like one.

We replace the chaos of spreadsheets and disparate notes with a unified "Operating System" designed to manage your pipeline, track your professional network, and leverage AI to maximize your productivity. Treat your search with the seriousness it deserves.

## 🚀 Features

- **Kanban-Style Job Board**: Visualize your job search pipeline from "Wishlist" to "Offer".
- **Daily Dashboard**: A centralized command center to track daily goals, upcoming interviews, and recent activity.
- **Application Management**: Keep track of every detail—job descriptions, salary ranges, and interview notes—in one place.
- **Data Resilience**: Export/Import your data to JSON backups or fully reset your workspace.
- **AI Copilot (Beta)**:
  - **Outreach Drafter**: Generate personalized cold outreach emails and follow-ups based on the role and company.
  - **Resume Analyst**: Analyze your resume against job descriptions to identify gaps and keywords (Coming Soon).
- **Privacy First**: All data is stored locally in your browser. You own your data.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Modern CSS3 (Variables, Flexbox/Grid)
- **State Management**: React Hooks & Context
- **Testing**: Vitest, React Testing Library
- **Linting**: ESLint

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/shanebe-ai/jobos.git
    cd jobos
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser at `http://localhost:8080` (or `http://localhost:5173`).
    *   **Note**: The app is configured to proxy API requests from `/api` to the backend server at `http://localhost:3002`. Ensure `letsmcp` is running on port 3002.

5.  **Important**: If you see connection errors, ensure `letsmcp` is running and accessible. The app uses a Vite proxy to bypass CORS and connect to the backend securely.

## 🧪 Running Tests

To run the test suite:

```bash
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
