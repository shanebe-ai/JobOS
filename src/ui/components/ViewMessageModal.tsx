import React from 'react';

interface ViewMessageModalProps {
    title: string;
    recipient: string;
    date: string;
    content: string;
    onClose: () => void;
}

export const ViewMessageModal: React.FC<ViewMessageModalProps> = ({ title, recipient, date, content, onClose }) => {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '600px', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>{title}</h2>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Sent to <strong>{recipient}</strong> on {new Date(date).toLocaleString()}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>

                <div style={{
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'sans-serif',
                    lineHeight: '1.6',
                    maxHeight: '60vh',
                    overflowY: 'auto'
                }}>
                    {content}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};
