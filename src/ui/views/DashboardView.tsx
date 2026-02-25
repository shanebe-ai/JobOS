import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import type { Job } from '../../domain/job';
import type { Application } from '../../domain/application';
import type { Engagement } from '../../domain/engagement';
import type { UserProfile } from '../../domain/user';
import { SuggestionList } from '../components/SuggestionList';
import { AppHeader } from '../components/AppHeader';
import { calculateCurrentStreak, hasAppliedToday, getStreakMessage, getStreakEmoji } from '../../utils/streak';
import { isStalled } from '../../domain/application';

interface DashboardViewProps {
    onNavigate: (view: 'dashboard' | 'board' | 'add-job' | 'detail' | 'routine') => void;
    onSelectJob?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectJob }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [greeting, setGreeting] = useState('');
    const [bestStreak, setBestStreak] = useState<number>(0);

    useEffect(() => {
        // Load Data
        const userProfile = StorageService.getUserProfile();
        setProfile(userProfile);
        setApplications(StorageService.getApplications());
        setJobs(StorageService.getJobs());
        setEngagements(StorageService.getEngagements());

        // Load streak data
        const streakData = StorageService.getStreakData();
        setBestStreak(streakData.bestStreak);

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
    // Active pipeline = not archived, not rejected, not withdrawn
    const activeAppsCount = applications.filter(a =>
        !a.archived &&
        a.status !== 'Rejected' &&
        a.status !== 'Withdrawn'
    ).length;
    const interviewCount = applications.filter(a => a.status === 'Interviewing' || a.status === 'Offer').length;

    // Count of jobs waiting in the extension queue (not yet imported)
    const pendingJobsCount = jobs.filter(j =>
        !applications.some(a => a.jobId === j.id)
    ).length;

    // Response Rate: (Interviews + Offers) / (Applied + Interview + Offer + Rejected) * 100
    // We exclude 'Saved' and 'OutreachStarted' from the denominator as they haven't been "applied" yet technically, 
    // or maybe we include everything. Let's exclude 'Saved' for accuracy.
    const appliedAppsCount = applications.filter(a => a.status !== 'Saved').length;
    const responseRate = appliedAppsCount > 0
        ? Math.round((interviewCount / appliedAppsCount) * 100)
        : 0;

    // 3. Streak Tracking
    const currentStreak = calculateCurrentStreak(applications);
    const appliedToday = hasAppliedToday(applications);
    const streakMessage = getStreakMessage(currentStreak, appliedToday);
    const streakEmoji = getStreakEmoji(currentStreak);

    // Update best streak if current exceeds it
    useEffect(() => {
        if (currentStreak > bestStreak) {
            setBestStreak(currentStreak);
            StorageService.saveStreakData({
                bestStreak: currentStreak,
                bestStreakDate: new Date().toISOString()
            });
        }
    }, [currentStreak, bestStreak]);

    // 4. Stalled Applications
    const stalledApps = applications.filter(app => isStalled(app));
    const stalledWithJobs = stalledApps.map(app => ({
        app,
        job: jobs.find(j => j.id === app.jobId),
    })).filter(({ job }) => !!job);

    // 5. Recent Activity (Last 5)
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
            <AppHeader
                title={<h1 style={{ marginBottom: '0.5rem' }}>{greeting}{profile?.name ? `, ${profile.name}` : ''}.</h1>}
                subtitle="Here is your daily briefing."
                onNavigate={onNavigate}
                currentView="dashboard"
            />

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
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Applications in progress
                        {pendingJobsCount > 0 && (
                            <span style={{ color: 'var(--primary-color)', marginLeft: '0.5rem' }}>
                                (+{pendingJobsCount} pending import)
                            </span>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Response Rate</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{responseRate}%</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{(interviewCount)} Interviews / Offers</div>
                </div>

                {/* Streak Widget */}
                <div className="card" style={{
                    borderLeft: currentStreak > 0 ? '4px solid var(--warning-color)' : '4px solid var(--border-color)',
                    background: currentStreak >= 7 ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : 'var(--surface-color)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>
                            Application Streak
                        </h3>
                        <span style={{ fontSize: '1.5rem' }}>{streakEmoji}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: currentStreak > 0 ? 'var(--warning-color)' : 'var(--text-secondary)' }}>
                            {currentStreak}
                        </span>
                        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                            {currentStreak === 1 ? 'day' : 'days'}
                        </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {streakMessage}
                    </div>
                    {bestStreak > 0 && bestStreak > currentStreak && (
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            marginTop: '0.5rem',
                            paddingTop: '0.5rem',
                            borderTop: '1px solid var(--border-color)'
                        }}>
                            Best: {bestStreak} days
                        </div>
                    )}
                </div>
            </div>

            {/* Follow-Up Reminders */}
            {stalledWithJobs.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#b45309' }}>
                        ⏰ Follow-Up Needed ({stalledWithJobs.length})
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {stalledWithJobs.map(({ app, job }) => {
                            const daysSince = Math.ceil(
                                Math.abs(new Date().getTime() - new Date(app.lastActionDate).getTime()) / (1000 * 60 * 60 * 24)
                            );
                            return (
                                <div key={app.id} className="card" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    borderLeft: '4px solid #f59e0b',
                                    background: '#fffbeb'
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 600 }}>{job!.title}</span>
                                        <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>@ {job!.company}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#b45309', marginLeft: '0.75rem' }}>
                                            No activity for {daysSince} days
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>{app.status}</span>
                                        {onSelectJob && (
                                            <button
                                                className="btn btn-outline"
                                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                                                onClick={() => onSelectJob(job!.id)}
                                            >
                                                Follow Up →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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
