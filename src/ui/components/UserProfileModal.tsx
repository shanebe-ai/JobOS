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
    const [importing, setImporting] = useState(false);
    const [importMsg, setImportMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            const saved = StorageService.getUserProfile();
            if (saved) setProfile(saved);
            setImportMsg('');
        }
    }, [isOpen]);

    const handleImportFromLinkedIn = async () => {
        setImporting(true);
        setImportMsg('');
        try {
            const res = await fetch('http://localhost:3002/api/profile');
            const json = await res.json();
            if (!json.success || !json.profile) {
                setImportMsg('No saved profile found. Visit your LinkedIn profile and click "Save Profile to JobOS" first.');
                return;
            }
            const p = json.profile;
            setProfile(prev => ({
                ...prev,
                name: p.name || prev.name,
                aboutMe: p.summary || prev.aboutMe,
                skills: p.skills?.length ? p.skills : prev.skills,
            }));
            setImportMsg(`✓ Imported from LinkedIn${p.headline ? ` — ${p.headline}` : ''}`);
        } catch {
            setImportMsg('Could not reach letsmcp. Make sure it is running on port 3002.');
        } finally {
            setImporting(false);
        }
    };

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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                        <div style={{ flex: 1, fontSize: '0.875rem' }}>
                            <strong>Import from LinkedIn</strong>
                            <p style={{ margin: '0.15rem 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                Go to your LinkedIn profile, click the blue "Save Profile to JobOS" button, then import here.
                            </p>
                            {importMsg && <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: importMsg.startsWith('✓') ? '#0369a1' : '#ef4444' }}>{importMsg}</p>}
                        </div>
                        <button
                            className="btn btn-outline"
                            style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                            onClick={handleImportFromLinkedIn}
                            disabled={importing}
                        >
                            {importing ? 'Importing...' : '⬇ Import'}
                        </button>
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
