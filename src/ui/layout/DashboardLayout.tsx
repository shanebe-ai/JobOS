import React from 'react';

interface DashboardLayoutProps {
    activeView: 'dashboard' | 'board' | 'add-job' | 'detail' | 'routine' | 'extension-install';
    onNavigate: (view: 'dashboard' | 'board' | 'add-job' | 'detail' | 'routine' | 'extension-install') => void;
    onAddCustomTask?: () => void;
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeView, onNavigate, onAddCustomTask }) => {
    return (
        <div className="layout">
            <aside className="sidebar">
                <h2 style={{ marginBottom: '2rem' }}>JobOS</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        className={`btn ${activeView === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ justifyContent: 'flex-start', border: 'none' }}
                        onClick={() => onNavigate('dashboard')}
                    >
                        🏠 Home
                    </button>
                    <button
                        className={`btn ${activeView === 'board' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ justifyContent: 'flex-start', border: 'none' }}
                        onClick={() => onNavigate('board')}
                    >
                        📋 Job Board
                    </button>
                    <button
                        className={`btn ${activeView === 'add-job' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ justifyContent: 'flex-start', border: 'none' }}
                        onClick={() => onNavigate('add-job')}
                    >
                        + Add Job
                    </button>
                    <button
                        className={`btn ${activeView === 'routine' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ justifyContent: 'flex-start', border: 'none' }}
                        onClick={() => onNavigate('routine')}
                    >
                        ✅ My Routine
                    </button>
                    <button
                        className="btn btn-outline"
                        style={{ justifyContent: 'flex-start', border: 'none' }}
                        onClick={onAddCustomTask}
                    >
                        + Custom Task
                    </button>
                    <div style={{ padding: '0.5rem', borderTop: '1px solid #e2e8f0', marginTop: 'auto' }}>
                        <a
                            href="/LinkedInJobOS.zip"
                            download
                            className="btn btn-outline"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                border: 'none',
                                textDecoration: 'none',
                                fontSize: '0.85rem'
                            }}
                        >
                            ⬇️ Download Extension
                        </a>
                        <button
                            className={`btn ${activeView === 'extension-install' ? 'btn-primary' : 'btn-outline'}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                border: 'none',
                                width: '100%',
                                marginTop: '0.5rem',
                                fontSize: '0.85rem'
                            }}
                            onClick={() => onNavigate('extension-install')}
                        >
                            🧩 Install Guide
                        </button>
                    </div>
                </nav>
            </aside>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};
