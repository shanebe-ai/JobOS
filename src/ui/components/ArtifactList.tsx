import React, { useState } from 'react';
import { type Artifact, type ArtifactType } from '../../domain/artifact';
import { StorageService } from '../../services/storage';
import { FileExtractionService } from '../../services/fileExtraction';
import { ConfirmationModal } from './ConfirmationModal';

interface ArtifactListProps {
    jobId?: string;
    artifacts: Artifact[];
    onUpdate: () => void;
    jobDescription?: string;
}

export const ArtifactList: React.FC<ArtifactListProps> = ({ jobId, artifacts, onUpdate, jobDescription }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [artifactToDelete, setArtifactToDelete] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);

    const confirmDelete = () => {
        if (artifactToDelete) {
            StorageService.deleteArtifact(artifactToDelete);
            setArtifactToDelete(null);
            onUpdate();
        }
    };

    const [formData, setFormData] = useState<Partial<Artifact>>({
        name: '',
        type: 'Resume',
        content: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        const newArtifact: Artifact = {
            id: crypto.randomUUID(),
            applicationId: jobId,
            type: formData.type as ArtifactType,
            name: formData.name,
            content: formData.content || '',
            version: 1,
            createdDate: new Date().toISOString(),
            lastModifiedDate: new Date().toISOString(),
            ...formData as any
        };

        StorageService.saveArtifact(newArtifact);
        setFormData({ name: '', type: 'Resume', content: '' });
        setIsAdding(false);
        onUpdate();
    };

    const relevantArtifacts = jobId
        ? artifacts.filter(a => a.applicationId === jobId)
        : artifacts;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Artifacts & Files</h3>
                <button className="btn btn-outline" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : '+ Add File'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <input className="input" placeholder="File Name (e.g. Targeted Resume)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <select className="input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                            <option value="Resume">Resume</option>
                            <option value="CoverLetter">Cover Letter</option>
                            <option value="Portfolio">Portfolio</option>
                            <option value="InterviewNotes">Interview Notes</option>
                            <option value="OutreachMessage">Outreach Draft</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '0.5rem', border: '2px dashed var(--border-color)', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                        <label style={{ cursor: 'pointer', display: 'block', color: 'var(--primary-color)' }}>
                            <span>
                                {isExtracting ? '⏳ Extracting text...' : '📁 Upload File (PDF, DOCX, TXT)'}
                            </span>
                            <input
                                type="file"
                                accept=".pdf,.docx,.txt,.md"
                                style={{ display: 'none' }}
                                disabled={isExtracting}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setIsExtracting(true);
                                        setFormData(prev => ({ ...prev, name: prev.name || file.name }));

                                        try {
                                            const text = await FileExtractionService.extractText(file);
                                            setFormData(prev => ({ ...prev, content: text }));
                                        } catch (err: any) {
                                            alert(`Failed to read file: ${err.message}`);
                                            setFormData(prev => ({
                                                ...prev,
                                                content: `[Attached File: ${file.name}]\n\n(Error reading content: ${err.message})`
                                            }));
                                        } finally {
                                            setIsExtracting(false);
                                        }
                                    }
                                }}
                            />
                        </label>
                    </div>

                    <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Content (Text used for AI)</label>
                        <textarea
                            className="input"
                            placeholder={isExtracting ? "Extracting text from document..." : "Paste content here..."}
                            style={{ height: '100px', fontFamily: 'monospace', fontSize: '0.8rem', opacity: isExtracting ? 0.5 : 1 }}
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            disabled={isExtracting}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            * Content is automatically extracted from your file so the AI can read it.
                        </p>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isExtracting}>Save Artifact</button>
                </form>
            )}

            <div>
                {relevantArtifacts.length === 0 && <p className="text-secondary">No artifacts yet.</p>}
                {relevantArtifacts.map(a => (
                    <div key={a.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>{a.name}</strong> <span className="badge" style={{ background: '#f1f5f9' }}>{a.type} v{a.version}</span>
                                <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(a.createdDate).toLocaleDateString()}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                    className="btn btn-icon danger"
                                    style={{ color: 'var(--error-color)', border: 'none', background: 'none', cursor: 'pointer', padding: '0.25rem', marginLeft: '0.5rem' }}
                                    onClick={() => setArtifactToDelete(a.id)}
                                    title="Delete Artifact"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={!!artifactToDelete}
                title="Delete Artifact"
                message="Are you sure you want to delete this file? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setArtifactToDelete(null)}
            />
        </div>
    );
};
