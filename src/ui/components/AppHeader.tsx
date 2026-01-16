import React, { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { UserProfileModal } from './UserProfileModal';

interface AppHeaderProps {
    title: React.ReactNode;
    subtitle?: string;
    onNavigate: (view: 'dashboard' | 'board' | 'add-job' | 'detail' | 'routine') => void;
    currentView?: 'dashboard' | 'board' | 'routine';
    children?: React.ReactNode; // For extra page-specific actions (like Add Suggestion)
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle, onNavigate, currentView, children }) => {
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    return (
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <UserProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />

            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />

            <div>
                {typeof title === 'string' ? <h1 style={{ margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>{title}</h1> : title}
                {subtitle && <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{subtitle}</p>}
                {!subtitle && <div style={{ height: '1.5em' }}></div>} {/* Invisible spacer to match subtitle height */}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {/* Global Actions */}
                <button
                    className="btn btn-outline"
                    style={{ fontSize: '0.9rem' }}
                    onClick={() => setShowSettingsModal(true)}
                >
                    ⚙️ Settings
                </button>
                <button
                    className="btn btn-outline"
                    style={{ fontSize: '0.9rem' }}
                    onClick={() => setShowProfileModal(true)}
                >
                    👤 My Profile
                </button>

                <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 0.25rem' }}></div>

                {/* Dashboard Nav - Only show if NOT on dashboard */}
                {currentView !== 'dashboard' && (
                    <button className="btn btn-outline" onClick={() => onNavigate('dashboard')}>Dashboard</button>
                )}

                {/* View Board Nav - Only show if NOT on board */}
                {currentView !== 'board' && (
                    <button className="btn btn-outline" onClick={() => onNavigate('board')}>View Board</button>
                )}

                {/* Routine Nav - Only show if NOT on routine */}
                {currentView !== 'routine' && (
                    <button className="btn btn-outline" onClick={() => onNavigate('routine')}>My Routine</button>
                )}

                {/* Add Job Always Visible (User requested it on all these pages) */}
                <button className="btn btn-primary" onClick={() => onNavigate('add-job')}>+ Add Job</button>

                {/* Page Specific Actions */}
                {children}
            </div>
        </div>
    );
};
