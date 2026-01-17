import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../../services/storage';
import type { Job } from '../../domain/job';

// Inline Icons
const Icons = {
    Trash2: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
        </svg>
    ),
    MapPin: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
        </svg>
    ),
    Building2: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
        </svg>
    ),
    Clock: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    Globe: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
        </svg>
    )
};


const API_URL = '/api/jobs';

interface JobBoardProps {
    onSelectJob: (id: string) => void;
    onNavigate: (view: string) => void;
}

const JobBoard: React.FC<JobBoardProps> = ({ onSelectJob, onNavigate }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const loadJobs = useCallback(() => {
        try {
            const storedJobs = StorageService.getJobs();
            setJobs(storedJobs);
        } catch (e) {
            console.error('Failed to load jobs', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteJob = async (id: string) => {
        if (!confirm("Are you sure you want to remove this job?")) return;

        // Delete from localStorage
        StorageService.deleteJob(id);

        // Delete from backend to prevent re-sync
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete job from backend:', error);
        }

        loadJobs();
    };

    const handleSync = async () => {
        if (syncing) return;
        setSyncing(true);
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Failed to fetch jobs');

            const data = await res.json();
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                const currentJobs = StorageService.getJobs();
                const currentIds = new Set(currentJobs.map(j => j.id));
                const newJobs = data.data.filter((j: Job) => !currentIds.has(j.id));

                if (newJobs.length > 0) {
                    newJobs.forEach((job: Job) => StorageService.saveJob(job));
                    loadJobs();
                }
            }
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        loadJobs();
        handleSync();
    }, [loadJobs]);

    useEffect(() => {
        const interval = setInterval(() => {
            handleSync();
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            loadJobs();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadJobs]);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Job Board...</div>;
    }

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>Job Board</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>Manage your scouted opportunities</p>
                </div>
                <div>
                    <span className="badge" style={{
                        background: syncing ? '#dbeafe' : '#f1f5f9',
                        color: syncing ? '#1e40af' : '#64748b'
                    }}>
                        {syncing ? 'Syncing...' : 'Auto-sync active'}
                    </span>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem'
            }}>
                {jobs.length === 0 ? (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '3rem',
                        border: '2px dashed var(--border-color)',
                        borderRadius: '12px',
                        background: '#fafafa'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#f1f5f9',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            <Icons.Globe style={{ width: '24px', height: '24px', color: '#94a3b8' }} />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', margin: '0 0 0.5rem' }}>No jobs found</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                            Use the JobOS Chrome Extension to scout jobs from LinkedIn, and they will appear here automatically.
                        </p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="card" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            position: 'relative',
                            transition: 'box-shadow 0.2s'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                                const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                                if (deleteBtn) deleteBtn.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                                const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                                if (deleteBtn) deleteBtn.style.opacity = '0';
                            }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span className="badge" style={{ background: '#dbeafe', color: '#1e40af' }}>
                                    New
                                </span>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteJob(job.id)}
                                    title="Remove Job"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                        color: '#94a3b8',
                                        opacity: 0,
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                                >
                                    <Icons.Trash2 style={{ width: '16px', height: '16px' }} />
                                </button>
                            </div>

                            <div>
                                <h3 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: 'bold',
                                    margin: '0 0 0.5rem',
                                    lineHeight: '1.4',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    <button
                                        onClick={() => onSelectJob(job.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                            color: 'var(--text-primary)',
                                            textDecoration: 'none',
                                            transition: 'color 0.2s',
                                            textAlign: 'left',
                                            font: 'inherit'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
                                        {job.title}
                                    </button>
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                    <Icons.Building2 style={{ width: '16px', height: '16px' }} />
                                    <span style={{ fontSize: '0.875rem' }}>{job.company}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <Icons.MapPin style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.location}</span>
                            </div>

                            <div style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.6',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {job.description ? job.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No description available.'}
                            </div>

                            <div style={{
                                paddingTop: '1rem',
                                marginTop: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.75rem',
                                color: '#94a3b8',
                                borderTop: '1px solid var(--border-color)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Icons.Clock style={{ width: '12px', height: '12px' }} />
                                    <span>{job.scrapedAt ? new Date(job.scrapedAt).toLocaleDateString() : 'Just now'}</span>
                                </div>
                                <a
                                    href={job.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        fontWeight: '500',
                                        color: 'var(--primary-color)',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    Apply <span style={{ fontSize: '10px' }}>↗</span>
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default JobBoard;
