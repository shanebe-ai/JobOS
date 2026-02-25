import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import type { CompanyResearchData } from '../../domain/research';
import { generateId } from '../../utils/uuid';

interface CompanyResearchTabProps {
    jobId: string;
    companyName: string;
    companyUrl?: string;
}

const EMPTY_RESEARCH: Omit<CompanyResearchData, 'id' | 'jobId' | 'lastUpdated'> = {
    mission: '',
    size: '',
    industry: '',
    techStack: '',
    culture: '',
    recentNews: '',
    funding: '',
    whyJoin: '',
    notes: '',
};

export const CompanyResearchTab: React.FC<CompanyResearchTabProps> = ({ jobId, companyName, companyUrl }) => {
    const [data, setData] = useState<Omit<CompanyResearchData, 'id' | 'jobId' | 'lastUpdated'>>(EMPTY_RESEARCH);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState(companyUrl || '');

    useEffect(() => {
        const existing = StorageService.getCompanyResearch(jobId);
        if (existing) {
            const { id: _id, jobId: _jid, lastUpdated: _lu, ...rest } = existing;
            setData(rest);
        }
    }, [jobId]);

    const handleSave = () => {
        const existing = StorageService.getCompanyResearch(jobId);
        StorageService.saveCompanyResearch({
            id: existing?.id || generateId(),
            jobId,
            ...data,
            lastUpdated: new Date().toISOString(),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleAIFetch = async () => {
        setLoading(true);
        setAiError(null);
        try {
            const settings = StorageService.getSettings();
            const baseUrl = settings.mcpUrl || '';
            const res = await fetch(`${baseUrl}/api/research`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName,
                    url: urlInput || undefined,
                    provider: settings.mcpProvider,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: res.statusText }));
                throw new Error(err.error || 'Research request failed');
            }
            const result = await res.json();
            const r = result.data;
            setData(prev => ({
                ...prev,
                mission: r.mission || prev.mission,
                size: r.size || prev.size,
                industry: r.industry || prev.industry,
                techStack: Array.isArray(r.techStack) ? r.techStack.join(', ') : (r.techStack || prev.techStack),
                culture: Array.isArray(r.culture) ? r.culture.join('\n') : (r.culture || prev.culture),
                recentNews: Array.isArray(r.recentNews) ? r.recentNews.join('\n') : (r.recentNews || prev.recentNews),
                funding: r.funding || prev.funding,
                whyJoin: Array.isArray(r.whyJoin) ? r.whyJoin.join('\n') : (r.whyJoin || prev.whyJoin),
            }));
        } catch (e: any) {
            setAiError(e.message || 'AI research failed');
        } finally {
            setLoading(false);
        }
    };

    const field = (label: string, key: keyof typeof data, multiline = false) => (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>{label}</label>
            {multiline ? (
                <textarea
                    className="input"
                    style={{ height: '80px', resize: 'vertical' }}
                    value={data[key]}
                    onChange={e => setData(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                />
            ) : (
                <input
                    className="input"
                    value={data[key]}
                    onChange={e => setData(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                />
            )}
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ margin: 0 }}>Company Research: {companyName}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        className="input"
                        style={{ width: '220px', marginBottom: 0 }}
                        placeholder="Company website URL (optional)"
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                    />
                    <button
                        className="btn btn-outline"
                        onClick={handleAIFetch}
                        disabled={loading}
                    >
                        {loading ? 'Researching...' : 'AI Research'}
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        {saved ? 'Saved!' : 'Save'}
                    </button>
                </div>
            </div>

            {aiError && (
                <div style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    {aiError} — Make sure letsmcp is running and has an AI provider configured.
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
                <div>
                    {field('Mission / What They Do', 'mission', true)}
                    {field('Company Size', 'size')}
                    {field('Industry', 'industry')}
                    {field('Funding / Stage', 'funding')}
                </div>
                <div>
                    {field('Tech Stack', 'techStack')}
                    {field('Culture & Values', 'culture', true)}
                    {field('Recent News', 'recentNews', true)}
                    {field('Why Join', 'whyJoin', true)}
                </div>
            </div>

            <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>My Notes & Questions to Ask</label>
                <textarea
                    className="input"
                    style={{ height: '120px', resize: 'vertical' }}
                    value={data.notes}
                    onChange={e => setData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Personal notes, questions to ask in interviews, red flags noticed..."
                />
            </div>
        </div>
    );
};
