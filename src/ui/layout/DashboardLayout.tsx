import React from 'react';

interface DashboardLayoutProps {
    activeView: 'dashboard' | 'board' | 'add-job' | 'detail' | 'routine';
    onNavigate: (view: 'dashboard' | 'board' | 'add-job' | 'detail' | 'routine') => void;
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
                </nav>
            </aside>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};
