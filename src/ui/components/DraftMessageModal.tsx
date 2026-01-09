import React, { useState } from 'react';
import { AIService } from '../../services/ai';
import type { OutreachDraftContext } from '../../domain/ai';

interface DraftMessageModalProps {
    context: OutreachDraftContext;
    onClose: () => void;
    onSave: (message: string) => void;
}

export const DraftMessageModal: React.FC<DraftMessageModalProps> = ({ context, onClose, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [draft, setDraft] = useState('');
    const [rationale, setRationale] = useState('');

    // Auto-generate on mount
    React.useEffect(() => {
        generate();
    }, []);

    const generate = async () => {
        setLoading(true);
        try {
            const response = await AIService.draftOutreach(context);
            setDraft(response.data.body);
            setRationale(response.rationale);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
                <h2>AI Copilot: Draft Message</h2>
                <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Drafting for: {context.recipientName} ({context.intent})
                </div>

                {/* Removed manual trigger button, auto-starting... */}

                {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>Thinking...</div>}

                {draft && (
                    <div>
                        <div style={{ padding: '0.5rem', background: '#e0f2fe', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            <strong>AI Rationale:</strong> {rationale}
                        </div>
                        <textarea
                            className="input"
                            style={{ height: '200px' }}
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button className="btn btn-outline" onClick={onClose}>Discard</button>
                            <button className="btn btn-primary" onClick={() => onSave(draft)}>Approve & Save</button>
                        </div>
                    </div>
                )}

                {!loading && !draft && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
};
