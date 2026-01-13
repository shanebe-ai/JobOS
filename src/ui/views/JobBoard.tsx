import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import type { Job } from '../../domain/job';
import type { Application } from '../../domain/application';
import type { Engagement } from '../../domain/engagement';
import { getSuggestedAction } from '../../domain/application';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { UserProfileModal } from '../components/UserProfileModal';
import { SuggestionList } from '../components/SuggestionList';
import { SettingsModal } from '../components/SettingsModal';

interface JobBoardProps {
    onSelectJob: (jobId: string) => void;
}

export const JobBoard: React.FC<JobBoardProps> = ({ onSelectJob }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [engagements, setEngagements] = useState<Engagement[]>([]);

    useEffect(() => {
        setJobs(StorageService.getJobs());
        setApplications(StorageService.getApplications());
        setEngagements(StorageService.getEngagements());
    }, []);

    const getStatus = (jobId: string) => {
        const app = applications.find(a => a.jobId === jobId);
        return app ? app.status : 'Saved';
    };

    const getAction = (jobId: string) => {
        const app = applications.find(a => a.jobId === jobId);
        const effectiveApp = app || { status: 'Saved' } as Application;
        return getSuggestedAction(effectiveApp);
    };

    const [showResetModal, setShowResetModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const handleReset = () => {
        StorageService.clearAll();
        window.location.reload();
    };

    return (
        <div>
            <ConfirmationModal
                isOpen={showResetModal}
                title="Reset Demo Data"
                message="Are you sure you want to reset all data to the default demo state? This action cannot be undone."
                onConfirm={handleReset}
                onCancel={() => setShowResetModal(false)}
            />

            <UserProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />

            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ marginBottom: 0 }}>Your Job Hunt</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        onClick={() => setShowSettingsModal(true)}
                    >
                        ⚙️ Settings
                    </button>
                    <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        onClick={() => setShowProfileModal(true)}
                    >
                        👤 My Profile
                    </button>
                    <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        onClick={() => setShowResetModal(true)}
                    >
                        Reset Demo Data
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 3 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {jobs.map(job => (
                            <div key={job.id} className="card" onClick={() => onSelectJob(job.id)} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <h3 style={{ marginTop: 0 }}>{job.title}</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span
                                            className="badge"
                                            style={{ background: '#fee2e2', color: '#991b1b', cursor: 'help' }}
                                            title={getAction(job.id) === 'Follow Up' ? 'No activity in > 7 days' : 'Suggested Action'}
                                        >
                                            {getAction(job.id)}
                                        </span>
                                        <span className="badge" style={{ background: '#e2e8f0', color: '#1e293b' }}>{getStatus(job.id)}</span>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0' }}>{job.company}</p>
                                <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>📍 {job.location} ({job.isRemote ? 'Remote' : 'On-site'})</p>

                                <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span>📅 Added: {new Date(job.dateAdded).toLocaleDateString()}</span>
                                    </div>
                                    {(() => {
                                        const jobEngagements = engagements.filter(e => e.applicationId === job.id);
                                        const lastEngagement = jobEngagements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                                        if (lastEngagement) {
                                            return (
                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    🔄 {new Date(lastEngagement.date).toLocaleDateString()}: {lastEngagement.description}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                    {jobs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            No jobs being tracked yet. Start by adding one!
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, minWidth: '300px' }}>
                    <SuggestionList />
                </div>
            </div>
        </div>
    );
};
