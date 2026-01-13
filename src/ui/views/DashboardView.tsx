import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import type { Job } from '../../domain/job';
import type { Application } from '../../domain/application';
import type { Engagement } from '../../domain/engagement';
import type { UserProfile } from '../../domain/user';
import { SuggestionList } from '../components/SuggestionList';

interface DashboardViewProps {
    onNavigate: (view: 'board' | 'add-job' | 'detail' | 'routine') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        // Load Data
        const userProfile = StorageService.getUserProfile();
        setProfile(userProfile);
        setApplications(StorageService.getApplications());
        setJobs(StorageService.getJobs());
        setEngagements(StorageService.getEngagements());

        // Set Greeting
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    // --- Metrics Logic ---

    // 1. Daily Application Goal (Target: 3)
    const appsAppliedToday = applications.filter(app => {
        if (app.status !== 'Applied') return false;
        const appDate = new Date(app.lastActionDate).toDateString();
        const today = new Date().toDateString();
        return appDate === today;
    }).length;

    const dailyGoalTarget = 3;
    const dailyGoalProgress = Math.min((appsAppliedToday / dailyGoalTarget) * 100, 100);

    // 2. Pulse Metrics
    const activeAppsCount = applications.filter(a => !a.archived && a.status !== 'Rejected').length;
    const interviewCount = applications.filter(a => a.status === 'Interview' || a.status === 'Offer').length;

    // Response Rate: (Interviews + Offers) / (Applied + Interview + Offer + Rejected) * 100
    // We exclude 'Saved' and 'OutreachStarted' from the denominator as they haven't been "applied" yet technically, 
    // or maybe we include everything. Let's exclude 'Saved' for accuracy.
    const appliedAppsCount = applications.filter(a => a.status !== 'Saved').length;
    const responseRate = appliedAppsCount > 0
        ? Math.round((interviewCount / appliedAppsCount) * 100)
        : 0;

    // 3. Recent Activity (Last 5)
    // We need to hydrate engagement descriptions with job/person names if possible, but EngagementLog handles that. 
    // Here we just list them.
    const recentActivity = [...engagements]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const getJobCompany = (jobId?: string) => {
        if (!jobId) return null;
        return jobs.find(j => j.id === jobId)?.company;
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>{greeting}{profile?.name ? `, ${profile.name}` : ''}.</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Here is your daily briefing.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-outline" onClick={() => onNavigate('board')}>View Board</button>
                    <button className="btn btn-primary" onClick={() => onNavigate('add-job')}>+ Add Job</button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Daily Goal Widget */}
                <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Daily Goal</h3>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{appsAppliedToday} / {dailyGoalTarget}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${dailyGoalProgress}%`,
                            height: '100%',
                            backgroundColor: dailyGoalProgress >= 100 ? '#10b981' : 'var(--primary-color)',
                            transition: 'width 0.5s ease-in-out'
                        }} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        {dailyGoalProgress >= 100 ? '🎉 Goal reached! Great work.' : 'Applications submitted today.'}
                    </p>
                </div>

                {/* Pulse Widgets */}
                <div className="card">
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Active Pipeline</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{activeAppsCount}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Applications in progress</div>
                </div>

                <div className="card">
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Response Rate</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{responseRate}%</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{(interviewCount)} Interviews / Offers</div>
                </div>
            </div>

            {/* Central Layout: Focus (Left) & Activity (Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>

                {/* Left Column: Today's Focus */}
                <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🎯 Today's Focus</h2>

                    {/* Reuse SuggestionList but maybe style it simpler? or just drop it in. 
                        SuggestionList has its own internal data fetching which is duplicated here if we are not careful.
                        Actually SuggestionList handles its own state, so we can just render it. 
                        We might want to pass a filter prop to it later to only show 'Today' items, but for now standard list is fine.
                    */}
                    <div style={{ marginBottom: '2rem' }}>
                        <SuggestionList />
                    </div>
                </div>

                {/* Right Column: Recent Activity */}
                <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Activity</h2>
                    <div className="card" style={{ padding: '0' }}>
                        {recentActivity.length === 0 ? (
                            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No activity yet. Log some work!
                            </div>
                        ) : (
                            <div>
                                {recentActivity.map((engagement, i) => (
                                    <div key={engagement.id} style={{
                                        padding: '1rem',
                                        borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-color)' : 'none',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem'
                                    }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{new Date(engagement.date).toLocaleDateString()}</span>
                                            <span>{engagement.platform}</span>
                                        </div>
                                        <div style={{ fontWeight: 500 }}>
                                            {engagement.type === 'StatusChange' ? '🔄 Status Update' : engagement.type}
                                            {engagement.applicationId && (
                                                <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)' }}>
                                                    {' '}for {getJobCompany(engagement.applicationId)}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.9rem' }}>{engagement.description}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
