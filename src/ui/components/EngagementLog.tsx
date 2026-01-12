import React, { useState } from 'react';
import { type Engagement, type EngagementType } from '../../domain/engagement';
import { StorageService } from '../../services/storage';

import type { Person } from '../../domain/person';

interface EngagementLogProps {
    jobId?: string; // Optional context
    engagements: Engagement[];
    contacts?: Person[];
    onUpdate: () => void;
}

export const EngagementLog: React.FC<EngagementLogProps> = ({ jobId, engagements, contacts = [], onUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<Partial<Engagement>>({
        type: 'Like',
        platform: 'LinkedIn',
        description: '',
        personId: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description) return;

        const newEngagement: Engagement = {
            id: crypto.randomUUID(),
            applicationId: jobId, // Link to job if provided
            personId: formData.personId || undefined,
            type: formData.type as EngagementType,
            platform: formData.platform as any,
            description: formData.description,
            date: new Date().toISOString(),
            ...formData as any
        };

        StorageService.saveEngagement(newEngagement);
        setFormData({ type: 'Like', platform: 'LinkedIn', description: '', personId: '' });
        setIsAdding(false);
        onUpdate();
    };

    const relevantEngagements = jobId
        ? engagements.filter(e => e.applicationId === jobId)
        : engagements;

    const getPersonName = (id?: string) => {
        if (!id) return null;
        const p = contacts.find(c => c.id === id);
        return p ? p.name : null;
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Engagement Log</h3>
                <button className="btn btn-outline" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : '+ Log Activity'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <select
                            className="input"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value as EngagementType })}
                        >
                            <option value="Like">Like</option>
                            <option value="Comment">Comment</option>
                            <option value="Share">Share</option>
                            <option value="Post">Post</option>
                            <option value="Connect">Connect</option>
                            <option value="Call">Call</option>
                            <option value="Email">Email</option>
                            <option value="Meeting">Meeting</option>
                        </select>
                        <select
                            className="input"
                            value={formData.platform}
                            onChange={e => setFormData({ ...formData, platform: e.target.value as any })}
                        >
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Twitter">Twitter</option>
                            <option value="Email">Email</option>
                            <option value="Phone">Phone</option>
                            <option value="Video">Video</option>
                            <option value="Other">Other</option>
                        </select>
                        {contacts.length > 0 && (
                            <select
                                className="input"
                                value={formData.personId}
                                onChange={e => setFormData({ ...formData, personId: e.target.value })}
                            >
                                <option value="">(No specific person)</option>
                                {contacts.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <input
                        className="input"
                        placeholder="What did you do? e.g. 'Commented on HM's post about AI'"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                    <button type="submit" className="btn btn-primary">Log It</button>
                </form>
            )}

            <div>
                {relevantEngagements.length === 0 && <p className="text-secondary">No engagement recorded yet.</p>}
                {relevantEngagements.map(e => (
                    <div key={e.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>
                                {e.type === 'StatusChange' ? '🔄 Status Update' : `${e.type} on ${e.platform}`}
                                {getPersonName(e.personId) && <span> with {getPersonName(e.personId)}</span>}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(e.date).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: '0.25rem 0' }}>{e.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
