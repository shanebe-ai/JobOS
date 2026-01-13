export type EngagementType =
    | 'Like'
    | 'Comment'
    | 'Share'
    | 'Post'
    | 'Connect'
    | 'StatusChange'
    | 'Outreach'
    | 'FollowUp';

export interface Engagement {
    id: string;
    personId?: string;
    applicationId?: string; // Related to a job pursuit?
    type: EngagementType;
    platform: 'LinkedIn' | 'Twitter' | 'Other';
    description: string; // "Liked X's post about Y"
    date: string;
    url?: string; // Link to the engagement if available
}
