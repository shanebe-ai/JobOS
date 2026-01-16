import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { WorkflowService } from '../../services/workflow';
import { ExtractorService } from '../../services/extractor';
import { GoogleGeminiProvider } from '../../services/ai/providers/gemini';
import { LetsMCPProvider } from '../../services/ai/providers/letsmcp';
import type { Job } from '../../domain/job';
import { generateId } from '../../utils/uuid';

interface AddJobViewProps {
    onJobAdded: () => void;
    onCancel: () => void;
}

export const AddJobView: React.FC<AddJobViewProps> = ({ onJobAdded, onCancel }) => {
    const [pasteUrl, setPasteUrl] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionSource, setExtractionSource] = useState<string>('');
    const [extractionError, setExtractionError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Job>>({
        title: '',
        company: '',
        location: '',
        isRemote: false,
        source: '',
        description: '',
    });

    const handleMagicPaste = async () => {
        if (!pasteUrl) return;
        setIsExtracting(true);
        setExtractionSource('');
        setExtractionError(null);

        try {
            // URL Normalization for LinkedIn
            // Converts https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4318618225
            // to https://www.linkedin.com/jobs/view/4318618225
            let contentToAnalyze = pasteUrl;
            try {
                if (contentToAnalyze.includes('linkedin.com') && contentToAnalyze.includes('currentJobId=')) {
                    const urlObj = new URL(contentToAnalyze);
                    const currentJobId = urlObj.searchParams.get('currentJobId');
                    if (currentJobId) {
                        contentToAnalyze = `https://www.linkedin.com/jobs/view/${currentJobId}`;
                        console.log('Normalized LinkedIn URL to:', contentToAnalyze);
                    }
                }
            } catch (e) {
                // Ignore URL parsing errors (could be just text)
            }

            const settings = StorageService.getSettings();

            // 1. Try LetsMCP first (includes LinkedIn scraping)
            if (settings.aiProvider === 'letsmcp' || !settings.apiKey) {
                try {
                    const mcpProvider = new LetsMCPProvider({
                        baseUrl: settings.mcpUrl || '',
                        provider: settings.mcpProvider as 'groq' | 'claude' | 'gemini',
                    });

                    // Check if MCP server is available
                    const isAvailable = await mcpProvider.isAvailable();
                    if (isAvailable) {
                        console.log('Attempting LetsMCP extraction...');
                        try {
                            const aiDetails = await mcpProvider.extractJobDetails(contentToAnalyze);

                            if (aiDetails.title || aiDetails.company) {
                                setExtractionSource('LetsMCP');
                                setFormData(prev => ({
                                    ...prev,
                                    title: aiDetails.title || prev.title,
                                    company: aiDetails.company || prev.company,
                                    location: aiDetails.location || prev.location,
                                    description: aiDetails.description || pasteUrl,
                                    source: contentToAnalyze.startsWith('http') ? new URL(contentToAnalyze).hostname : prev.source,
                                    isRemote: aiDetails.location?.toLowerCase().includes('remote') || prev.isRemote,
                                }));
                                setIsExtracting(false);
                                return;
                            }
                        } catch (err: any) {
                            // Capture LetsMCP specific errors (like Login Required)
                            if (err.message && err.message.includes('LinkedIn')) {
                                setExtractionError(err.message);
                            }
                            throw err; // Re-throw to trigger fallback
                        }
                    }
                    console.warn('LetsMCP unavailable or returned empty, trying Gemini...');
                } catch (err) {
                    console.warn('LetsMCP extraction failed, falling back to Gemini:', err);
                }
            }

            // 2. Try Gemini if API Key is configured
            if (settings.apiKey) {
                try {
                    const provider = new GoogleGeminiProvider(settings.apiKey, settings.model);
                    console.log('Attempting Gemini extraction...');
                    const aiDetails = await provider.extractJobDetails(contentToAnalyze);

                    if (aiDetails.title || aiDetails.company) {
                        setExtractionSource('Gemini');
                        setFormData(prev => ({
                            ...prev,
                            title: aiDetails.title || prev.title,
                            company: aiDetails.company || prev.company,
                            location: aiDetails.location || prev.location,
                            description: aiDetails.description || pasteUrl,
                            source: contentToAnalyze.startsWith('http') ? new URL(contentToAnalyze).hostname : prev.source,
                            isRemote: aiDetails.location?.toLowerCase().includes('remote') || prev.isRemote,
                        }));
                        setIsExtracting(false);
                        return;
                    } else {
                        console.warn('Gemini returned empty details. Using fallback.');
                    }
                } catch (err) {
                    console.warn('Gemini extraction failed, falling back to regex:', err);
                }
            }

            // 3. Final fallback: Regex / Basic Extractor
            setExtractionSource('Local');
            const extracted = await ExtractorService.extractJobDetails(contentToAnalyze);
            setFormData(prev => ({
                ...prev,
                ...extracted,
                description: extracted.description || prev.description || pasteUrl,
                source: extracted.source || (contentToAnalyze.startsWith('http') ? new URL(contentToAnalyze).hostname : 'Unknown')
            }));
        } catch (error) {
            // Restore simpler error logging without alert
            console.error("Extraction failed", error);
            setFormData(prev => ({ ...prev, description: pasteUrl }));
        } finally {
            setIsExtracting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.company) return;

        const newJob: Job = {
            id: generateId(),
            title: formData.title,
            company: formData.company,
            location: formData.location || '',
            isRemote: formData.isRemote || false,
            source: formData.source || '',
            description: formData.description || '',
            dateAdded: new Date().toISOString(),
            ...formData as any
        };

        StorageService.saveJob(newJob);
        WorkflowService.createApplication(newJob.id);
        onJobAdded();
    };

    // Check if this looks like a LinkedIn URL
    const isLinkedInUrl = pasteUrl && /linkedin\.com\/jobs\/view/i.test(pasteUrl);

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1>Add New Job</h1>

            {/* Magic Paste Section */}
            <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bae6fd' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#0369a1' }}>✨ Magic Paste (Smart Fill)</label>

                {/* LinkedIn URL hint */}
                {isLinkedInUrl && (
                    <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#ecfdf5', color: '#047857', borderRadius: '4px', fontSize: '0.85rem' }}>
                        🔗 <strong>LinkedIn URL detected!</strong> We'll try to scrape the job details directly.
                    </div>
                )}

                {/* Generic URL warning (non-LinkedIn) */}
                {pasteUrl && /^(http|https):\/\//.test(pasteUrl) && !isLinkedInUrl && !pasteUrl.includes('demo-job') && (
                    <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#fffbeb', color: '#b45309', borderRadius: '4px', fontSize: '0.85rem' }}>
                        ⚠️ <strong>Note:</strong> For best results, <strong>copy and paste the full job description text</strong> here.
                    </div>
                )}

                {/* Extraction source indicator */}
                {extractionSource && (
                    <div style={{ marginBottom: '0.5rem', padding: '0.25rem 0.5rem', background: '#e0e7ff', color: '#3730a3', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-block' }}>
                        Extracted via: {extractionSource}
                    </div>
                )}

                {extractionError && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.85rem' }}>
                        ⛔ {extractionError}
                    </div>
                )}

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
                `}
                </style>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        className="input"
                        placeholder="Paste Job Description, Text, or LinkedIn URL..."
                        value={pasteUrl}
                        onChange={e => setPasteUrl(e.target.value)}
                        style={{ marginBottom: 0 }}
                    />
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleMagicPaste}
                        disabled={isExtracting || !pasteUrl}
                        style={{ minWidth: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        {isExtracting ? (
                            <span>
                                Thinking
                                <span className="loading-dot">.</span>
                                <span className="loading-dot">.</span>
                                <span className="loading-dot">.</span>
                            </span>
                        ) : 'Auto-Fill'}
                    </button>
                </div>
                <small style={{ color: '#0369a1', display: 'block', marginTop: '0.5rem' }}>
                    * Paste job text or LinkedIn URL. Pro Tip: Try <code>demo-job</code> to see it in action!
                </small>
            </div>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Job Title</label>
                    <input
                        className="input"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label>Company</label>
                    <input
                        className="input"
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label>Location</label>
                    <input
                        className="input"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={formData.isRemote}
                            onChange={e => setFormData({ ...formData, isRemote: e.target.checked })}
                        /> Remote?
                    </label>
                </div>
                <div>
                    <label>Source (LinkedIn, Referral, etc.)</label>
                    <input
                        className="input"
                        value={formData.source}
                        onChange={e => setFormData({ ...formData, source: e.target.value })}
                    />
                </div>
                <div>
                    <label>Job Description</label>
                    <textarea
                        className="input"
                        style={{ height: '150px' }}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary">Save Job</button>
                    <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};
