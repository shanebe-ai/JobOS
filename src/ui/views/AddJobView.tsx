import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { WorkflowService } from '../../services/workflow';
import { ExtractorService } from '../../services/extractor';
import { GoogleGeminiProvider } from '../../services/ai/providers/gemini';
import type { Job } from '../../domain/job';

interface AddJobViewProps {
    onJobAdded: () => void;
    onCancel: () => void;
}

export const AddJobView: React.FC<AddJobViewProps> = ({ onJobAdded, onCancel }) => {
    const [pasteUrl, setPasteUrl] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
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
        try {
            // 1. Try AI Extraction if API Key is configured
            const settings = StorageService.getSettings();
            if (settings.apiKey) {
                try {
                    const provider = new GoogleGeminiProvider(settings.apiKey, settings.model);
                    console.log('Attempting AI extraction...');
                    const aiDetails = await provider.extractJobDetails(pasteUrl);

                    if (aiDetails.title || aiDetails.company) {
                        setFormData(prev => ({
                            ...prev,
                            title: aiDetails.title || prev.title,
                            company: aiDetails.company || prev.company,
                            location: aiDetails.location || prev.location,
                            description: aiDetails.description || pasteUrl,
                            // Use simple heuristic for remote validation if strict boolean needed, 
                            // or just trust user to toggle. 
                            // For now, if location says 'Remote', check it.
                            isRemote: aiDetails.location?.toLowerCase().includes('remote') || prev.isRemote,
                        }));
                        setIsExtracting(false);
                        return;
                    }
                } catch (err) {
                    console.warn('AI Extraction failed, falling back to regex:', err);
                }
            }

            // 2. Fallback to Regex / Basic Scraper
            const extracted = await ExtractorService.extractJobDetails(pasteUrl);
            setFormData(prev => ({
                ...prev,
                ...extracted,
            }));
        } catch (error) {
            console.error("Extraction failed", error);
            // Even if extraction fails, at least put the text in description
            setFormData(prev => ({ ...prev, description: pasteUrl }));
        } finally {
            setIsExtracting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.company) return;

        const newJob: Job = {
            id: crypto.randomUUID(),
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

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1>Add New Job</h1>

            {/* Magic Paste Section */}
            <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bae6fd' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#0369a1' }}>✨ Magic Paste (Smart Fill)</label>

                {/* Helpful Tip for URLs */}
                {pasteUrl && /^(http|https):\/\//.test(pasteUrl) && !pasteUrl.includes('demo-job') && (
                    <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#fffbeb', color: '#b45309', borderRadius: '4px', fontSize: '0.85rem' }}>
                        ⚠️ <strong>Note:</strong> AI cannot browse live websites (like LinkedIn) directly. <br />
                        Please <strong>copy and paste the full job description text</strong> here for best results!
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
                        placeholder="Paste Job Description, Text, or URL..."
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
                    * Paste the full text of the job post here. Pro Tip: Try <code>demo-job</code> to see it in action!
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
