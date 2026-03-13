import type { UserProfile } from '../domain/user';
import type { Job } from '../domain/job';
import type { Application } from '../domain/application';
import type { Person } from '../domain/person';
import type { Action } from '../domain/action';
import type { Engagement } from '../domain/engagement';
import type { Artifact } from '../domain/artifact';
import type { CompanyResearchData } from '../domain/research';
import type { StarStory } from '../domain/star';

const STORAGE_KEYS = {
    JOBS: 'job_os_jobs',
    APPLICATIONS: 'job_os_applications',
    PEOPLE: 'job_os_people',
    ACTIONS: 'job_os_actions',
    ENGAGEMENTS: 'job_os_engagements',
    ARTIFACTS: 'job_os_artifacts',
    USER_PROFILE: 'job_os_user_profile',
    SUGGESTIONS: 'job_os_suggestions',
    STREAK_DATA: 'job_os_streak_data',
    COMPANY_RESEARCH: 'job_os_company_research',
    STAR_STORIES: 'job_os_star_stories',
};

// Per-user namespace — set at login, kept for the session
let _userId = 'anon';
const pKey = (k: string) => `${k}__${_userId}`;

// Streak data interface for persistence
export interface PersistedStreakData {
    bestStreak: number;
    bestStreakDate: string;
}

// Generic helper to get/set — all keys are namespaced per user
const get = <T>(key: string): T[] => {
    const data = localStorage.getItem(pKey(key));
    return data ? JSON.parse(data) : [];
};

const set = <T>(key: string, data: T[]) => {
    localStorage.setItem(pKey(key), JSON.stringify(data));
};

export const StorageService = {
    // Jobs
    getJobs: () => get<Job>(STORAGE_KEYS.JOBS),
    saveJob: (job: Job) => {
        const jobs = get<Job>(STORAGE_KEYS.JOBS);
        const index = jobs.findIndex((j) => j.id === job.id);
        if (index >= 0) jobs[index] = job;
        else jobs.push(job);
        set(STORAGE_KEYS.JOBS, jobs);
    },
    deleteJob: (id: string) => {
        // Delete the job
        const jobs = get<Job>(STORAGE_KEYS.JOBS).filter(j => j.id !== id);
        set(STORAGE_KEYS.JOBS, jobs);

        // Cascade delete: Remove associated application
        const apps = get<Application>(STORAGE_KEYS.APPLICATIONS).filter(a => a.jobId !== id);
        set(STORAGE_KEYS.APPLICATIONS, apps);
    },

    // Applications
    getApplications: () => get<Application>(STORAGE_KEYS.APPLICATIONS),
    saveApplication: (app: Application) => {
        const apps = get<Application>(STORAGE_KEYS.APPLICATIONS);
        const index = apps.findIndex((a) => a.id === app.id);
        if (index >= 0) apps[index] = app;
        else apps.push(app);
        set(STORAGE_KEYS.APPLICATIONS, apps);
    },

    // People
    getPeople: () => get<Person>(STORAGE_KEYS.PEOPLE),
    savePerson: (person: Person) => {
        const people = get<Person>(STORAGE_KEYS.PEOPLE);
        const index = people.findIndex(p => p.id === person.id);
        if (index >= 0) people[index] = person;
        else people.push(person);
        set(STORAGE_KEYS.PEOPLE, people);
    },
    deletePerson: (id: string) => {
        const people = get<Person>(STORAGE_KEYS.PEOPLE).filter(p => p.id !== id);
        set(STORAGE_KEYS.PEOPLE, people);
    },

    // Actions
    getActions: () => get<Action>(STORAGE_KEYS.ACTIONS),
    saveAction: (action: Action) => {
        const actions = get<Action>(STORAGE_KEYS.ACTIONS);
        const index = actions.findIndex(a => a.id === action.id);
        if (index >= 0) actions[index] = action;
        else actions.push(action);
        set(STORAGE_KEYS.ACTIONS, actions);
    },

    // Engagements
    getEngagements: () => get<Engagement>(STORAGE_KEYS.ENGAGEMENTS),
    saveEngagement: (engagement: Engagement) => {
        const engagements = get<Engagement>(STORAGE_KEYS.ENGAGEMENTS);
        const index = engagements.findIndex(e => e.id === engagement.id);
        if (index >= 0) engagements[index] = engagement;
        else engagements.push(engagement);
        set(STORAGE_KEYS.ENGAGEMENTS, engagements);
    },

    // Artifacts
    getArtifacts: () => get<Artifact>(STORAGE_KEYS.ARTIFACTS),
    saveArtifact: (artifact: Artifact) => {
        const artifacts = StorageService.getArtifacts();
        const index = artifacts.findIndex(a => a.id === artifact.id);
        if (index >= 0) {
            artifacts[index] = artifact;
        } else {
            artifacts.push(artifact);
        }
        localStorage.setItem(pKey(STORAGE_KEYS.ARTIFACTS), JSON.stringify(artifacts));
    },
    deleteArtifact: (id: string) => {
        const artifacts = get<Artifact>(STORAGE_KEYS.ARTIFACTS).filter(a => a.id !== id);
        set(STORAGE_KEYS.ARTIFACTS, artifacts);
    },

    // Suggestions
    getSuggestions: () => get<any>(STORAGE_KEYS.SUGGESTIONS), // Using 'any' to avoid import cycle if unrelated, but better to import type
    saveSuggestion: (suggestion: any) => {
        const suggestions = get<any>(STORAGE_KEYS.SUGGESTIONS);
        const index = suggestions.findIndex(s => s.id === suggestion.id);
        if (index >= 0) suggestions[index] = suggestion;
        else suggestions.push(suggestion);
        set(STORAGE_KEYS.SUGGESTIONS, suggestions);
    },
    deleteSuggestion: (id: string) => {
        const suggestions = get<any>(STORAGE_KEYS.SUGGESTIONS).filter(s => s.id !== id);
        set(STORAGE_KEYS.SUGGESTIONS, suggestions);
    },

    // Streak Data
    getStreakData: (): PersistedStreakData => {
        const data = localStorage.getItem(pKey(STORAGE_KEYS.STREAK_DATA));
        return data ? JSON.parse(data) : { bestStreak: 0, bestStreakDate: '' };
    },
    saveStreakData: (data: PersistedStreakData) => {
        localStorage.setItem(pKey(STORAGE_KEYS.STREAK_DATA), JSON.stringify(data));
    },

    setUserId: (id: string) => {
        _userId = id;
    },

    initialize: (force: boolean = false) => {
        // 1. Cleanup Orphans: Remove applications that point to non-existent jobs
        const jobs = get<Job>(STORAGE_KEYS.JOBS);
        const apps = get<Application>(STORAGE_KEYS.APPLICATIONS);
        const jobIds = new Set(jobs.map(j => j.id));

        const validApps = apps.filter(a => jobIds.has(a.jobId));
        if (validApps.length !== apps.length) {
            console.log(`JobOS: Cleaning up ${apps.length - validApps.length} orphaned applications.`);
            set(STORAGE_KEYS.APPLICATIONS, validApps);
        }

        if (force || !localStorage.getItem(pKey(STORAGE_KEYS.JOBS))) {
            const seedJobs: Job[] = [
                {
                    id: 'job-1',
                    title: 'Senior Product Engineer',
                    company: 'TechCorp',
                    location: 'Remote',
                    isRemote: true,
                    source: 'LinkedIn',
                    description: 'We are looking for a product-minded engineer to lead our core team. React/Node/TS stack.',
                    dateAdded: new Date().toISOString()
                },
                {
                    id: 'job-2',
                    title: 'Founding Engineer',
                    company: 'Stealth AI Startup',
                    location: 'San Francisco',
                    isRemote: false,
                    source: 'Referral',
                    description: 'Early stage AI startup building the future of work. High equity, high agency.',
                    dateAdded: new Date().toISOString()
                },
                {
                    id: 'job-3',
                    title: 'Frontend Lead',
                    company: 'DesignSystem Inc.',
                    location: 'New York',
                    isRemote: false,
                    source: 'Hacker News',
                    description: 'Leading the design system team. Heavy focus on a11y and performance.',
                    dateAdded: new Date().toISOString()
                },
                {
                    id: 'job-4',
                    title: 'Product Manager',
                    company: 'ScaleUp SaaS',
                    location: 'Remote',
                    isRemote: true,
                    source: 'LinkedIn',
                    description: 'Looking for a PM to own the growth funnel.',
                    dateAdded: new Date(Date.now() - 8 * 86400000).toISOString()
                }
            ];

            const seedApps: Application[] = [
                {
                    id: 'app-1',
                    jobId: 'job-1',
                    status: 'Applied',
                    notes: 'Applied via website. Strong referral from Sarah.',
                    lastActionDate: new Date().toISOString(),
                    archived: false
                },
                {
                    id: 'app-2',
                    jobId: 'job-2',
                    status: 'OutreachStarted',
                    notes: 'Emailed the founder directly.',
                    lastActionDate: new Date(Date.now() - 86400000).toISOString(),
                    archived: false
                },
                {
                    id: 'app-3',
                    jobId: 'job-3',
                    status: 'Saved',
                    notes: 'Need to update portfolio before applying.',
                    lastActionDate: new Date().toISOString(),
                    archived: false
                },
                {
                    id: 'app-4',
                    jobId: 'job-4',
                    status: 'Applied', // Stalled state
                    notes: 'Applied last week. Crickets so far.',
                    lastActionDate: new Date(Date.now() - 8 * 86400000).toISOString(),
                    archived: false
                }
            ];

            const seedPeople: Person[] = [
                {
                    id: 'p-1',
                    name: 'Sarah Jenkins',
                    role: 'Engineering Director',
                    company: 'TechCorp',
                    type: 'Referral',
                    email: 'sarah@techcorp.com',
                    notes: 'Worked together at PreviousCo.',
                    dateAdded: new Date(Date.now() - 86400000 * 10).toISOString()
                },
                {
                    id: 'p-2',
                    name: 'David Chen',
                    role: 'Founder',
                    company: 'Stealth AI Startup',
                    type: 'Recruiter', // Using Recruiter as proxy/fallback for Founder if needed
                    email: 'david@stealth.ai',
                    notes: 'Met at AI meetup.',
                    dateAdded: new Date(Date.now() - 86400000).toISOString()
                }
            ];

            const seedArtifacts: Artifact[] = [
                {
                    id: 'art-1',
                    applicationId: 'job-1',
                    type: 'Resume',
                    name: 'TechCorp Targeted Resume',
                    content: 'Experience: Senior Engineer...\nSkills: React, TypeScript, Node.js...',
                    version: 1,
                    createdDate: new Date().toISOString(),
                    lastModifiedDate: new Date().toISOString()
                }
            ];

            const seedSuggestions = [
                {
                    id: 'sugg-1',
                    title: 'Publish LinkedIn Content',
                    description: 'Share a recent learning or project update.',
                    frequency: 'Weekly',
                    nextDueDate: new Date().toISOString(),
                    isActive: true,
                    history: [],
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'sugg-2',
                    title: 'Read Tech News',
                    description: 'Spend 15 mins reading HN or TechCrunch.',
                    frequency: 'Daily',
                    nextDueDate: new Date().toISOString(),
                    isActive: true,
                    history: [],
                    createdAt: new Date().toISOString()
                }
            ];

            localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(seedJobs));
            localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(seedApps));
            localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(seedPeople));
            localStorage.setItem(STORAGE_KEYS.ARTIFACTS, JSON.stringify(seedArtifacts));
            localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(seedSuggestions));
        }
    },

    // User Profile
    getUserProfile: () => {
        const data = localStorage.getItem(pKey(STORAGE_KEYS.USER_PROFILE));
        return data ? JSON.parse(data) : null;
    },
    saveUserProfile: (profile: UserProfile) => {
        localStorage.setItem(pKey(STORAGE_KEYS.USER_PROFILE), JSON.stringify(profile));
    },

    // Reset — clears only current user's data, not global settings
    clearAll: () => {
        // Set all lists to empty arrays so initialize() sees "data exists" and doesn't re-seed
        set(STORAGE_KEYS.JOBS, []);
        set(STORAGE_KEYS.APPLICATIONS, []);
        set(STORAGE_KEYS.PEOPLE, []);
        set(STORAGE_KEYS.ACTIONS, []);
        set(STORAGE_KEYS.ENGAGEMENTS, []);
        set(STORAGE_KEYS.ARTIFACTS, []);
        set(STORAGE_KEYS.SUGGESTIONS, []);
        set(STORAGE_KEYS.COMPANY_RESEARCH, []);
        set(STORAGE_KEYS.STAR_STORIES, []);
        localStorage.removeItem(pKey(STORAGE_KEYS.USER_PROFILE));
        localStorage.removeItem(pKey(STORAGE_KEYS.STREAK_DATA));
    },

    // Data Management (Backup/Restore)
    exportAllData: (): string => {
        const backup: Record<string, any> = {
            meta: { version: 1, date: new Date().toISOString(), appName: 'JobOS' },
            data: {}
        };
        Object.values(STORAGE_KEYS).forEach(key => {
            const raw = localStorage.getItem(pKey(key));
            if (raw) {
                try { backup.data[key] = JSON.parse(raw); } catch { /* skip */ }
            }
        });
        const settings = localStorage.getItem('job_os_settings');
        if (settings) backup.data['job_os_settings'] = JSON.parse(settings);
        return JSON.stringify(backup, null, 2);
    },

    importData: (jsonContent: string): boolean => {
        try {
            const backup = JSON.parse(jsonContent);
            if (!backup?.meta?.appName || backup.meta.appName !== 'JobOS') return false;
            Object.entries(backup.data).forEach(([key, value]) => {
                const validKeys = Object.values(STORAGE_KEYS);
                if (validKeys.includes(key)) {
                    localStorage.setItem(pKey(key), JSON.stringify(value));
                } else if (key === 'job_os_settings') {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            });
            return true;
        } catch {
            return false;
        }
    },

    // Company Research
    getCompanyResearch: (jobId: string): CompanyResearchData | null => {
        const all = get<CompanyResearchData>(STORAGE_KEYS.COMPANY_RESEARCH);
        return all.find(r => r.jobId === jobId) || null;
    },
    saveCompanyResearch: (research: CompanyResearchData) => {
        const all = get<CompanyResearchData>(STORAGE_KEYS.COMPANY_RESEARCH);
        const idx = all.findIndex(r => r.jobId === research.jobId);
        if (idx >= 0) all[idx] = research;
        else all.push(research);
        set(STORAGE_KEYS.COMPANY_RESEARCH, all);
    },

    // STAR Stories
    getStarStories: (jobId: string): StarStory[] => {
        return get<StarStory>(STORAGE_KEYS.STAR_STORIES).filter(s => s.jobId === jobId);
    },
    saveStarStory: (story: StarStory) => {
        const all = get<StarStory>(STORAGE_KEYS.STAR_STORIES);
        const idx = all.findIndex(s => s.id === story.id);
        if (idx >= 0) all[idx] = story;
        else all.push(story);
        set(STORAGE_KEYS.STAR_STORIES, all);
    },
    deleteStarStory: (id: string) => {
        const all = get<StarStory>(STORAGE_KEYS.STAR_STORIES).filter(s => s.id !== id);
        set(STORAGE_KEYS.STAR_STORIES, all);
    },

    // Settings (API Keys, etc)
    getSettings: () => {
        const data = localStorage.getItem('job_os_settings');
        const settings = data ? JSON.parse(data) : {
            aiProvider: 'letsmcp', // Default to LetsMCP first
            apiKey: '',
            model: 'gemini-1.5-flash',
            mcpUrl: '', // Default to relative path via proxy
            mcpProvider: 'groq', // Default provider on MCP server
        };

        // Runtime patch: If URL is explicitly localhost:3002 (old default), clear it to use proxy
        if (settings.mcpUrl === 'http://localhost:3002') {
            settings.mcpUrl = '';
        }
        return settings;
    },
    saveSettings: (settings: {
        aiProvider: string;
        apiKey: string;
        model?: string;
        mcpUrl?: string;
        mcpProvider?: string;
    }) => {
        localStorage.setItem('job_os_settings', JSON.stringify(settings));
    }
};
