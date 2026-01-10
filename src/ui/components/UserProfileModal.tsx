import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { type UserProfile } from '../../domain/user';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        linkedInUrl: '',
        aboutMe: '',
        skills: [],
    });

    useEffect(() => {
        if (isOpen) {
            const saved = StorageService.getUserProfile();
            if (saved) {
                setProfile(saved);
            }
        }
    }, [isOpen]);

    const handleSave = () => {
        StorageService.saveUserProfile(profile);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ maxWidth: '600px', width: '100%', margin: '1rem', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>My Profile</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div className="alert alert-info">
                        This information provides "Global Context" for the AI. Fill this out so the AI knows who you are when drafting emails and analyzing matches.
                    </div>

                    <div>
                        <label className="label">Full Name</label>
                        <input
                            className="input"
                            style={{ width: '100%' }}
                            value={profile.name}
                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                            placeholder="Jane Doe"
                        />
                    </div>

                    <div>
                        <label className="label">LinkedIn URL</label>
                        <input
                            className="input"
                            style={{ width: '100%' }}
                            value={profile.linkedInUrl || ''}
                            onChange={e => setProfile({ ...profile, linkedInUrl: e.target.value })}
                            placeholder="https://linkedin.com/in/..."
                        />
                    </div>

                    <div>
                        <label className="label">About Me (Bio/Summary)</label>
                        <textarea
                            className="input"
                            style={{ width: '100%', minHeight: '100px', fontFamily: 'inherit' }}
                            value={profile.aboutMe || ''}
                            onChange={e => setProfile({ ...profile, aboutMe: e.target.value })}
                            placeholder="I am a Senior Product Engineer with 5 years of experience in..."
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Paste your LinkedIn "About" section or Resume Summary here.
                        </p>
                    </div>

                    <div>
                        <label className="label">Top Skills (Comma Joined)</label>
                        <input
                            className="input"
                            style={{ width: '100%' }}
                            value={profile.skills?.join(', ') || ''}
                            onChange={e => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()) })}
                            placeholder="React, TypeScript, Product Management, Public Speaking"
                        />
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave}>Save Profile</button>
                </div>
            </div>
        </div>
    );
};
