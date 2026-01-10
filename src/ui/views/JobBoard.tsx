import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import type { Job } from '../../domain/job';
import type { Application } from '../../domain/application';
import { getSuggestedAction } from '../../domain/application';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { UserProfileModal } from '../components/UserProfileModal';

interface JobBoardProps {
    onSelectJob: (jobId: string) => void;
}

export const JobBoard: React.FC<JobBoardProps> = ({ onSelectJob }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        setJobs(StorageService.getJobs());
        setApplications(StorageService.getApplications());
    }, []);

    const getStatus = (jobId: string) => {
        const app = applications.find(a => a.jobId === jobId);
        return app ? app.status : 'Saved';
    };

    const getAction = (jobId: string) => {
        const app = applications.find(a => a.jobId === jobId);
        // Create a temporary "virtual" application for Saved jobs if one doesn't exist yet
        // This ensures they get the "Apply Now" suggestion
        const effectiveApp = app || { status: 'Saved' } as Application;
        return getSuggestedAction(effectiveApp);
    };

    const [showResetModal, setShowResetModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ marginBottom: 0 }}>Your Job Hunt</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {jobs.map(job => (
                    <div key={job.id} className="card" onClick={() => onSelectJob(job.id)} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <h3 style={{ marginTop: 0 }}>{job.title}</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>{getAction(job.id)}</span>
                                <span className="badge" style={{ background: '#e2e8f0', color: '#1e293b' }}>{getStatus(job.id)}</span>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>{job.company}</p>
                        <p style={{ fontSize: '0.875rem' }}>📍 {job.location} ({job.isRemote ? 'Remote' : 'On-site'})</p>
                    </div>
                ))}
            </div>
            {jobs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No jobs being tracked yet. Start by adding one!
                </div>
            )}
        </div>
    );
};
