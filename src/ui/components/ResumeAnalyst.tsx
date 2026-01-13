import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { GoogleGeminiProvider } from '../../services/ai/providers/gemini';
import type { Artifact } from '../../domain/artifact';

interface ResumeAnalystProps {
    jobDescription: string;
    artifacts: Artifact[];
}

export const ResumeAnalyst: React.FC<ResumeAnalystProps> = ({ jobDescription, artifacts }) => {
    const [selectedArtifactId, setSelectedArtifactId] = useState<string>('');
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [modelName, setModelName] = useState<string>('gemini-1.5-flash');

    const resumes = artifacts.filter(a => a.type === 'Resume');

    useEffect(() => {
        const settings = StorageService.getSettings();
        setApiKey(settings.apiKey);
        if (settings.model) {
            setModelName(settings.model);
        }
        if (resumes.length > 0) {
            setSelectedArtifactId(resumes[0].id);
        }
    }, [artifacts]);

    // Local / Offline Analysis Logic
    const generateLocalAnalysis = (jd: string, resumeContent: string): string => {
        // Simple keyword extraction for fallback
        const commonTechKeywords = [
            'React', 'TypeScript', 'Node', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'NoSQL',
            'Agile', 'Jira', 'Leadership', 'Communication', 'Design System', 'CI/CD', 'Testing', 'Jest', 'Cypress'
        ];

        const jdLower = jd.toLowerCase();
        const resumeLower = resumeContent.toLowerCase();

        const foundKeywords = commonTechKeywords.filter(k => jdLower.includes(k.toLowerCase()) && resumeLower.includes(k.toLowerCase()));
        const missingKeywords = commonTechKeywords.filter(k => jdLower.includes(k.toLowerCase()) && !resumeLower.includes(k.toLowerCase()));

        // Calculate a naive score
        const score = Math.min(100, 50 + (foundKeywords.length * 5));

        return `
            <div class="analysis-result">
                <h3>⚠️ Offline Match Score: ~${score}%</h3>
                <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 1rem;">
                    (Generated using Local Keyword Matcher because AI is unavailable)
                </p>

                <h4>🟢 Quick Match (Keywords Found)</h4>
                <ul>
                    ${foundKeywords.length > 0 ? foundKeywords.map(k => `<li>${k}</li>`).join('') : '<li>No common tech keywords detected by simple match.</li>'}
                </ul>

                <h4>🔴 Potential Gaps (Keywords in JD but not Resume)</h4>
                <ul>
                    ${missingKeywords.length > 0 ? missingKeywords.map(k => `<li>${k}</li>`).join('') : '<li>No obvious missing keywords from common list.</li>'}
                </ul>

                <h4>💡 Recommendation</h4>
                <ul>
                    <li>Check if you have these missing keywords in your resume but phrased differently.</li>
                    <li>Ensure your formatting is readable.</li>
                </ul>
            </div>
        `;
    };

    const handleAnalyze = async () => {
        if (!selectedArtifactId) return;

        const resume = resumes.find(r => r.id === selectedArtifactId);
        if (!resume) return;

        setLoading(true);
        setError(null);
        setAnalysis(null);

        // Hybrid Mode: Try AI if Key exists, else Local
        if (apiKey) {
            try {
                const provider = new GoogleGeminiProvider(apiKey, modelName);
                const prompt = `
                Role: Expert Recruiter / ATS Specialist.
                Task: Analyze the fit between the Resume and Job Description.
                
                Job Description:
                "${jobDescription}"
                
                Resume Content:
                "${resume.content}"
                
                Output Format:
                Return raw HTML (no markdown backticks, no \`\`\`html wrapper).
                Use simple styling:
                - Use <h3> for headers (Match Score, Strengths, Gaps).
                - Use <ul> and <li> for lists.
                - Use <strong> for emphasis.
                - For Match Score, make it large and bold.
                
                Example Structure:
                <div class="analysis-result">
                  <h3>Match Score: 85%</h3>
                  <h4>🟢 Strengths</h4>
                  <ul>...</ul>
                  <h4>🔴 Critical Gaps</h4>
                  <ul>...</ul>
                  <h4>💡 Recommendations</h4>
                  <ul>...</ul>
                </div>
                `;

                let result = await provider.generateText(prompt);
                // Clean up if the model adds backticks despite instructions
                result = result.replace(/```html/g, '').replace(/```/g, '');
                setAnalysis(result);
            } catch (err: any) {
                console.warn('AI Analysis failed, falling back to local.', err);
                const localResult = generateLocalAnalysis(jobDescription, resume.content);
                setAnalysis(localResult);
            }
        } else {
            // No Key -> Direct Local Mode
            const localResult = generateLocalAnalysis(jobDescription, resume.content);
            setAnalysis(localResult);
        }

        setLoading(false);
    };

    if (!apiKey) {
        return (
            <div className="card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', textAlign: 'center', padding: '2rem' }}>
                <p>🤖 Configure AI Settings to use Resume Analyst</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Click "Settings" in the top right.</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h3>🤖 Resume Analyst</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Identify gaps between your resume and the job description.
            </p>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Resume</label>
                {resumes.length > 0 ? (
                    <select
                        value={selectedArtifactId}
                        onChange={(e) => setSelectedArtifactId(e.target.value)}
                        className="input"
                        style={{ width: '100%' }}
                    >
                        {resumes.map(r => (
                            <option key={r.id} value={r.id}>{r.name} (v{r.version})</option>
                        ))}
                    </select>
                ) : (
                    <div style={{ padding: '0.5rem', background: '#fffbeb', color: '#b45309', borderRadius: '4px', fontSize: '0.9rem' }}>
                        ⚠️ No eligible resumes found. Add a "Resume" artifact below first.
                    </div>
                )}
            </div>

            <style>
                {`
                    @keyframes blink {
                        0% { opacity: 0.2; }
                        20% { opacity: 1; }
                        100% { opacity: 0.2; }
                    }
                    .loading-dot {
                        animation-name: blink;
                        animation-duration: 1.4s;
                        animation-iteration-count: infinite;
                        animation-fill-mode: both;
                    }
                    .loading-dot:nth-child(2) { animation-delay: 0.2s; }
                    .loading-dot:nth-child(3) { animation-delay: 0.4s; }
                    
                    /* Custom Scrollbar for Analysis */
                    .analysis-content::-webkit-scrollbar {
                        width: 8px;
                    }
                    .analysis-content::-webkit-scrollbar-track {
                        background: #f1f5f9;
                    }
                    .analysis-content::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 4px;
                    }
                    .analysis-content h3 { color: var(--primary-color); margin-top: 0; }
                    .analysis-content h4 { margin-top: 1rem; margin-bottom: 0.5rem; }
                    .analysis-content ul { padding-left: 1.2rem; margin: 0.5rem 0; }
                `}
            </style>

            <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={loading || resumes.length === 0}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
                {loading ? (
                    <span>
                        Analyzing
                        <span className="loading-dot">.</span>
                        <span className="loading-dot">.</span>
                        <span className="loading-dot">.</span>
                    </span>
                ) : '✨ Run Gap Analysis'}
            </button>

            {error && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.9rem' }}>
                    Error: {error}
                </div>
            )}

            {analysis && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <div
                        className="analysis-content"
                        style={{
                            maxHeight: '300px',
                            overflowY: 'auto',
                            paddingRight: '0.5rem',
                            whiteSpace: 'normal',
                            lineHeight: '1.6',
                            fontSize: '0.95rem'
                        }}
                        dangerouslySetInnerHTML={{ __html: analysis }}
                    />
                </div>
            )}
        </div>
    );
};
