import React from 'react';
import type { Suggestion } from '../../domain/suggestion';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    suggestions: Suggestion[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, suggestions }) => {
    if (!isOpen) return null;

    // Flatten history
    const historyItems = suggestions.flatMap(s =>
        s.history.map(h => ({
            ...h,
            suggestionTitle: s.title
        }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>Activity History</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>

                {historyItems.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No history yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem' }}>Date</th>
                                <th style={{ padding: '0.5rem' }}>Task</th>
                                <th style={{ padding: '0.5rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyItems.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '0.5rem' }}>{new Date(item.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.5rem' }}>{item.suggestionTitle}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <span className={`badge ${item.action === 'Completed' ? 'badge-success' : 'badge-secondary'}`}
                                            style={{ background: item.action === 'Completed' ? '#dcfce7' : '#f1f5f9', color: item.action === 'Completed' ? '#166534' : '#475569' }}>
                                            {item.action}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
