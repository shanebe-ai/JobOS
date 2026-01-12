import React from 'react';

interface DashboardLayoutProps {
    activeView: 'board' | 'add-job' | 'detail';
    onNavigate: (view: 'board' | 'add-job' | 'detail') => void;
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeView, onNavigate }) => {
    return (
        <div className="layout">
            <aside className="sidebar">
                <h2 style={{ marginBottom: '2rem' }}>JobOS</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        className={`btn ${activeView === 'board' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ justifyContent: 'flex-start', border: 'none' }}
                        onClick={() => onNavigate('board')}
                    >
                        Dashboard
                    </button>
                    <button
                        className={`btn ${activeView === 'add-job' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ justifyContent: 'flex-start', border: 'none' }}
                        onClick={() => onNavigate('add-job')}
                    >
                        + Add Job
                    </button>
                </nav>
            </aside>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};
