import React from 'react';
import type { Suggestion } from '../../domain/suggestion';

interface SuggestionCardProps {
    suggestion: Suggestion;
    onComplete: (id: string) => void;
    onSkip: (id: string) => void;
    onEdit: (suggestion: Suggestion) => void;
    onDelete: (id: string) => void;
    statusOverride?: 'Completed' | 'Skipped' | 'Open' | null;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onComplete, onSkip, onEdit, onDelete, statusOverride }) => {
    // Determine priority color based on frequency (Visual cue)
    const getBorderColor = () => {
        if (statusOverride === 'Completed') return '4px solid #22c55e'; // Green
        if (statusOverride === 'Skipped') return '4px solid #94a3b8'; // Grey
        switch (suggestion.frequency) {
            case 'Daily': return '4px solid #ef4444'; // Red for daily
            case 'Weekly': return '4px solid #f59e0b'; // Orange for weekly
            default: return '4px solid #3b82f6'; // Blue for others
        }
    };

    return (
        <div className="card" style={{ borderLeft: getBorderColor(), marginBottom: '1rem', position: 'relative', opacity: statusOverride && statusOverride !== 'Open' ? 0.75 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <strong style={{ display: 'block', fontSize: '1rem' }}>{suggestion.title}</strong>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                            {suggestion.frequency}
                        </span>
                        {statusOverride === 'Completed' && <span style={{ fontSize: '0.75rem', color: '#15803d', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>Completed Today</span>}
                        {statusOverride === 'Skipped' && <span style={{ fontSize: '0.75rem', color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>Skipped</span>}
                    </div>
                </div>
                {!statusOverride && (
                    <div className="dropdown" style={{ position: 'relative' }}>
                        <button
                            className="btn-icon"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', padding: '0 0.5rem' }}
                            onClick={(e) => {
                                const menu = e.currentTarget.nextElementSibling;
                                if (menu) (menu as HTMLElement).style.display = (menu as HTMLElement).style.display === 'block' ? 'none' : 'block';
                            }}
                        >
                            ⋮
                        </button>
                        <div className="dropdown-menu" style={{
                            display: 'none',
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            zIndex: 10,
                            minWidth: '120px'
                        }}>
                            <button
                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                                onClick={(e) => {
                                    (e.target as HTMLElement).parentElement!.style.display = 'none';
                                    onEdit(suggestion);
                                }}
                            >
                                Edit
                            </button>
                            <button
                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                onClick={(e) => {
                                    (e.target as HTMLElement).parentElement!.style.display = 'none';
                                    onDelete(suggestion.id);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {suggestion.description && (
                <p style={{ fontSize: '0.875rem', margin: '0.5rem 0', color: '#4b5563' }}>{suggestion.description}</p>
            )}

            {!statusOverride && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button
                        className="btn"
                        style={{ flex: 1, padding: '0.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #16a34a', color: '#16a34a', background: 'white' }}
                        onClick={() => onComplete(suggestion.id)}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                        ✅ Done
                    </button>
                    <button
                        className="btn btn-outline"
                        style={{ flex: 1, padding: '0.25rem', fontSize: '0.875rem' }}
                        onClick={() => onSkip(suggestion.id)}
                    >
                        ⏭ Skip
                    </button>
                </div>
            )}
        </div>
    );
};
