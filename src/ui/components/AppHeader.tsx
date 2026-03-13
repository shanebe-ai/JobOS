import React, { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { UserProfileModal } from './UserProfileModal';
import { useAuth } from '../../context/AuthContext';

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
    const { user, signOut } = useAuth();

    return (
        <div style={{ marginBottom: '2rem' }}>
            <UserProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />

            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />

            <div style={{ marginBottom: '1rem' }}>
                {typeof title === 'string' ? <h1 style={{ margin: '0 0 0.25rem 0', lineHeight: 1.2 }}>{title}</h1> : title}
                {subtitle && <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{subtitle}</p>}
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

                <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 0.25rem' }}></div>

                {/* User avatar + sign out */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {user?.picture
                        ? <img src={user.picture} alt={user.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>
                            {user?.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                    }
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.name?.split(' ')[0]}
                    </span>
                    <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}
                        onClick={signOut}
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );

};
