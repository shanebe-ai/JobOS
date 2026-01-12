import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { WorkflowService } from '../../services/workflow';
import { ExtractorService } from '../../services/extractor';
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
            const extracted = await ExtractorService.extractJobDetails(pasteUrl);
            setFormData(prev => ({
                ...prev,
                ...extracted,
                // prioritize extracted but don't overwrite if user typed something specific? 
                // actually, magic paste usually implies "I want to fill from this", so overwrite empty or even existing is safer for "Reset" feeling.
                // Let's merge safely.
            }));
        } catch (error) {
            console.error("Extraction failed", error);
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
            ...formData as any // Safety cast for optional fields not yet in partial
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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        className="input"
                        placeholder="Paste LinkedIn/Indeed URL here..."
                        value={pasteUrl}
                        onChange={e => setPasteUrl(e.target.value)}
                        style={{ marginBottom: 0 }}
                    />
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleMagicPaste}
                        disabled={isExtracting || !pasteUrl}
                        style={{ minWidth: '100px' }}
                    >
                        {isExtracting ? 'Thinking...' : 'Auto-Fill'}
                    </button>
                </div>
                <small style={{ color: '#0369a1', display: 'block', marginTop: '0.5rem' }}>
                    * Pro Tip: Try <code>demo-job</code> to see it in action!
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
