export type ApplicationStatus =
    | 'Saved'
    | 'Applied'
    | 'OutreachStarted'
    | 'Interviewing'
    | 'Offer'
    | 'Rejected'
    | 'Stalled'
    | 'Withdrawn';

export interface Application {
    id: string;
    jobId: string;
    status: ApplicationStatus;
    appliedDate?: string;
    lastActionDate: string; // Critical for stalled detection
    notes: string;
    archived: boolean;
}

// State Machine Transitions
export const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
    Saved: ['Applied', 'Withdrawn'],
    Applied: ['OutreachStarted', 'Interviewing', 'Rejected', 'Stalled', 'Withdrawn'],
    OutreachStarted: ['Interviewing', 'Rejected', 'Stalled', 'Withdrawn'],
    Interviewing: ['Offer', 'Rejected', 'Withdrawn'],
    Offer: ['Withdrawn'], // Accepted is implicit "Win" or separate state? Keeping simple for V1.
    Rejected: ['Stalled'], // Can revive if mistake or new role
    Stalled: ['OutreachStarted', 'Applied', 'Withdrawn'], // Revive
    Withdrawn: ['Saved'], // Re-open
};

export const isStalled = (app: Application, daysThreshold: number = 7): boolean => {
    const diffTime = Math.abs(new Date().getTime() - new Date(app.lastActionDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > daysThreshold && !['Saved', 'Rejected', 'Withdrawn', 'Offer'].includes(app.status);
};

export const getSuggestedAction = (app: Application): string => {
    if (isStalled(app)) return 'Follow Up'; // Stalled takes precedence

    switch (app.status) {
        case 'Saved': return 'Apply Now';
        case 'Applied': return 'Log Response'; // Assuming "Applied" means we are waiting
        case 'OutreachStarted': return 'Log Response';
        case 'Interviewing': return 'Pre-brief';
        case 'Offer': return 'Review Offer';
        case 'Rejected': return 'Archive';
        case 'Withdrawn': return 'Archive';
        default: return 'Review';
    }
};
