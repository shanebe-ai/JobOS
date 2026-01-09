import type { Job } from '../domain/job';
import type { Application } from '../domain/application';
import type { Person } from '../domain/person';
import type { Action } from '../domain/action';
import type { Engagement } from '../domain/engagement';
import type { Artifact } from '../domain/artifact';

const STORAGE_KEYS = {
    JOBS: 'job_os_jobs',
    APPLICATIONS: 'job_os_applications',
    PEOPLE: 'job_os_people',
    ACTIONS: 'job_os_actions',
    ENGAGEMENTS: 'job_os_engagements',
    ARTIFACTS: 'job_os_artifacts',
};

// Generic helper to get/set
const get = <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const set = <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
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
        const jobs = get<Job>(STORAGE_KEYS.JOBS).filter(j => j.id !== id);
        set(STORAGE_KEYS.JOBS, jobs);
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
        localStorage.setItem(STORAGE_KEYS.ARTIFACTS, JSON.stringify(artifacts));
    },

    initialize: () => {
        if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
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

            localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(seedJobs));
            localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(seedApps));
            localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(seedPeople));
            localStorage.setItem(STORAGE_KEYS.ARTIFACTS, JSON.stringify(seedArtifacts));
        }
    },

    // Reset
    clearAll: () => {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
};
