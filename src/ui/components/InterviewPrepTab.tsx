import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import type { StarStory } from '../../domain/star';
import { generateId } from '../../utils/uuid';

interface InterviewPrepTabProps {
    jobId: string;
    jobTitle: string;
    jobDescription?: string;
}

const EMPTY_STORY: Omit<StarStory, 'id' | 'jobId' | 'createdDate' | 'lastModifiedDate'> = {
    skill: '',
    situation: '',
    task: '',
    action: '',
    result: '',
};

export const InterviewPrepTab: React.FC<InterviewPrepTabProps> = ({ jobId, jobTitle, jobDescription }) => {
    const [stories, setStories] = useState<StarStory[]>([]);
    const [editing, setEditing] = useState<string | null>(null); // story id or 'new'
    const [form, setForm] = useState<Omit<StarStory, 'id' | 'jobId' | 'createdDate' | 'lastModifiedDate'>>(EMPTY_STORY);

    const loadStories = () => {
        setStories(StorageService.getStarStories(jobId));
    };

    useEffect(() => {
        loadStories();
    }, [jobId]);

    const startNew = () => {
        setForm(EMPTY_STORY);
        setEditing('new');
    };

    const startEdit = (story: StarStory) => {
        const { id: _id, jobId: _jid, createdDate: _cd, lastModifiedDate: _lm, ...rest } = story;
        setForm(rest);
        setEditing(story.id);
    };

    const handleSave = () => {
        if (!form.skill || !form.situation) return;
        const now = new Date().toISOString();
        if (editing === 'new') {
            StorageService.saveStarStory({
                id: generateId(),
                jobId,
                ...form,
                createdDate: now,
                lastModifiedDate: now,
            });
        } else if (editing) {
            const existing = stories.find(s => s.id === editing);
            StorageService.saveStarStory({
                id: editing,
                jobId,
                ...form,
                createdDate: existing?.createdDate || now,
                lastModifiedDate: now,
            });
        }
        setEditing(null);
        loadStories();
    };

    const handleDelete = (id: string) => {
        if (!confirm('Delete this STAR story?')) return;
        StorageService.deleteStarStory(id);
        loadStories();
    };

    const COMMON_COMPETENCIES = [
        'Leadership', 'Problem Solving', 'Teamwork', 'Communication',
        'Conflict Resolution', 'Initiative', 'Adaptability', 'Technical Skills',
        'Time Management', 'Ownership', 'Data-Driven', 'Customer Focus'
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: 0 }}>Interview Prep: {jobTitle}</h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Build your STAR story bank for this role
                    </p>
                </div>
                {editing === null && (
                    <button className="btn btn-primary" onClick={startNew}>+ Add STAR Story</button>
                )}
            </div>

            {/* Story editor */}
            {editing !== null && (
                <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary-color)', background: '#f0f9ff' }}>
                    <h4 style={{ marginTop: 0 }}>{editing === 'new' ? 'New STAR Story' : 'Edit STAR Story'}</h4>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                            Competency / Skill Demonstrated
                        </label>
                        <input
                            className="input"
                            value={form.skill}
                            onChange={e => setForm(p => ({ ...p, skill: e.target.value }))}
                            placeholder="e.g. Leadership, Problem Solving..."
                            list="competencies"
                        />
                        <datalist id="competencies">
                            {COMMON_COMPETENCIES.map(c => <option key={c} value={c} />)}
                        </datalist>
                    </div>

                    {(['situation', 'task', 'action', 'result'] as const).map(field => (
                        <div key={field} style={{ marginBottom: '1rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                {field.charAt(0).toUpperCase() + field.slice(1)}
                                {field === 'situation' && ' — Set the context. When & where?'}
                                {field === 'task' && ' — What was your responsibility?'}
                                {field === 'action' && ' — Specifically what did YOU do?'}
                                {field === 'result' && ' — Measurable outcome?'}
                            </label>
                            <textarea
                                className="input"
                                style={{ height: '70px', resize: 'vertical' }}
                                value={form[field]}
                                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                                placeholder={
                                    field === 'situation' ? 'Describe the context and background...' :
                                    field === 'task' ? 'What were you responsible for...' :
                                    field === 'action' ? 'Describe the specific steps you took...' :
                                    'Quantify the impact if possible...'
                                }
                            />
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary" onClick={handleSave} disabled={!form.skill || !form.situation}>
                            Save Story
                        </button>
                        <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Story list */}
            {stories.length === 0 && editing === null ? (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    border: '2px dashed var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                    <p style={{ margin: 0 }}>No STAR stories yet.</p>
                    <p style={{ margin: '0.25rem 0 1rem', fontSize: '0.875rem' }}>
                        Add stories that demonstrate skills relevant to "{jobTitle}"
                    </p>
                    <button className="btn btn-primary" onClick={startNew}>Add Your First Story</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {stories.map(story => (
                        <div key={story.id} className="card" style={{ borderLeft: '4px solid #10b981' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#065f46' }}>{story.skill}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                                        onClick={() => startEdit(story)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}
                                        onClick={() => handleDelete(story.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                {(['situation', 'task', 'action', 'result'] as const).map(field => (
                                    story[field] && (
                                        <div key={field}>
                                            <span style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                                {field}
                                            </span>
                                            <p style={{ margin: '0.1rem 0', lineHeight: 1.5 }}>{story[field]}</p>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Job description context hint */}
            {jobDescription && stories.length === 0 && editing === null && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <strong>Tip:</strong> Review the job description for keywords like "leadership", "cross-functional", "data-driven"
                    and prepare a STAR story for each key competency.
                </div>
            )}
        </div>
    );
};
